// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract CrowdFunding {
    // Milestone struct
    struct Milestone {
        string description;
        uint256 amount;
        // --- IPFS proof hash system ---
        // Owner uploads proof (photos, invoices, report) to IPFS and submits
        // the content hash here. Donors fetch it at ipfs://[proofHash] and
        // independently verify before voting.
        string proofHash;
        bool proofSubmitted;
        bool approved;
        bool paid;
        uint256 votesFor;
        uint256 votesAgainst;
        // After proof is submitted, open a fixed voting window (e.g. 7 days). 
        // If donors vote against and the milestone fails, the owner can't simply resubmit
        // They will need to submit new proof and restart the window
        uint256 proofSubmittedAt;
    }

    enum CampaignStatus {
        Active,
        Successful,
        Failed,
        Cancelled
    }
    // Campaign struct
    struct Campaign {
        address owner;
        string title;
        string description;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        address[] donators;
        uint256[] donations;
        Milestone[] milestones;
        uint256 nextMilestoneToPay; 
        CampaignStatus status;
    }
    
    mapping(uint256 => Campaign) public campaigns;

    // Tracks how many campaigns exist and assigns ID to them
    uint256 public numberOfCampaigns = 0;

    // Campaign ID -> User Address -> Amount Donated
    mapping(uint256 => mapping(address => uint256)) public contributionOf;

    // Campaign ID -> User Address -> Has User Donated => Either true or false 
    mapping(uint256 => mapping(address => bool)) public isDonator;

    // Campaign ID -> Milestone ID -> User Address -> Has Donor Voted => Either true or false
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) public hasVoted;

    // Voting window: 7 days after proof is submitted
    uint256 public constant VOTING_WINDOW = 7 days;

    // --- events ---
    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed owner,
        uint256 target,
        uint256 deadline
    );

    event DonationReceived(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount
    );

    event CampaignFinalized(
        uint256 indexed campaignId,
        CampaignStatus status
    );

    event CampaignCancelled(
        uint256 indexed campaignId
    );

    event ProofSubmitted(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        string ipfsHash
    );

    event MilestoneVoted(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        address indexed voter,
        bool support,   
        uint256 weight
    );

    event MilestoneApproved(
        uint256 indexed campaignId,
        uint256 indexed milestoneId
    );

    event MilestonePaid(
        uint256 indexed campaignId,
        uint256 indexed milestoneId,
        uint256 amount
    );

    event Refunded(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount
    );


    // --- reentrancy guard ---
    bool private locked;
    modifier nonReentrant(){
        require(!locked, "Reentrancy");
        locked = true;
    // A special symbol that tells the modifier to pause while the actual functions in the contract runs
        _;
        locked = false;
    }

    /*
        Functions
    */

    // Function to create a campaign
    function createCampaign(
        address _owner, 
        string memory _title, 
        string memory _description, 
        uint256 _target, 
        uint256 _deadline,
        string[] memory _milestoneDescriptions,
        uint256[] memory _milestoneAmounts
        ) public returns (uint256) {
        // Error might be here
        // I will switch back to (campaign.deadline) in case i encouter any error
        require(_owner != address(0), "Invalid owner");
        //  --- A deadline cannot be set in the past ---
        require(_deadline > block.timestamp, "The deadline must be a date in the future.");
        //  --- The target amount has to be greater than zero --- 
        require(_target > 0, "Target must be greater than 0");
        // Safety check: number of descriptions must match number of requested amounts.
        require(_milestoneDescriptions.length ==  _milestoneAmounts.length, "Milestone counts must match");
        require(_milestoneDescriptions.length >  0, "No Milestones");

        // Pointer that tells solidity to find an empty space in the campaigns mapping at index 0 
        // uint256 campaignId = numberOfCampaigns;
        Campaign storage campaign = campaigns[numberOfCampaigns];
        // Write to Blockchain
        campaign.owner = _owner;
        campaign.title = _title;
        campaign.description = _description;
        campaign.target = _target;
        campaign.deadline = _deadline;
        campaign.amountCollected = 0;
        campaign.nextMilestoneToPay = 0;
        campaign.status = CampaignStatus.Active;

        // Milestone creation
        // --- The loop below takes temporary arrays the user sent and saves each milestone permanently into the blockchain database ---
        uint256 totalMilestoneAmount = 0;
        for (uint256 i = 0; i < _milestoneDescriptions.length; i++) {
            campaign.milestones.push(Milestone({
                description: _milestoneDescriptions[i],
                amount: _milestoneAmounts[i],
                proofHash: "",
                proofSubmitted: false,
                approved: false,
                paid: false,
                votesFor: 0,
                votesAgainst: 0,
                proofSubmittedAt: 0
            }));
            totalMilestoneAmount += _milestoneAmounts[i];
        }
        // Ensures milestone amounts doesn't exceed the campaign target
        require(totalMilestoneAmount <= _target, "Milestone amounts exceed target");
        // Increment count for the next campaign
        uint256 campaignId = numberOfCampaigns;
        numberOfCampaigns++;

        emit CampaignCreated(campaignId, _owner, _target, _deadline);
        return campaignId;
    }


    // Function to enable donation to campaign - Funds stay in escrow
    function donateToCampaign(uint256 _campaignId) public payable {
        // With payable keyword the function can receive ethereum

        require(_campaignId < numberOfCampaigns, "Campaign does not exist");
        // Pointer that shows what campaign is receiving the donation
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.value > 0, "Donation amount must be greater than 0");
        // Indicating that a user cannot donate after the campaign deadline has passed
        require(block.timestamp < campaign.deadline, "Campaign deadline has passed");
        require(campaign.status == CampaignStatus.Active, "Campaign is not active");

        // This checks if the user(msg.sender) is marked as a donor for this campaign(_campaignId) 
        if(!isDonator[_campaignId][msg.sender]) {
            isDonator[_campaignId][msg.sender] = true;
            campaign.donators.push(msg.sender);
            campaign.donations.push(0);
        }
        // This then adds previous donations of user(msg.sender)
        contributionOf[_campaignId][msg.sender] += msg.value;
        // Then we add the the contribution to the existing amount collected from the campaign
        campaign.amountCollected += msg.value;

        // Funds are locked in this contract, they can only be withdrawn when milestones are approved
        emit DonationReceived(_campaignId, msg.sender, msg.value);
    }


    // Function to finalize campaign
    function finalizeCampaign(uint256 _campaignId) public {
        require(_campaignId < numberOfCampaigns, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];
        require(campaign.status == CampaignStatus.Active, "Already Finalized");
        require(block.timestamp >= campaign.deadline, "Deadline not reached yet");

        if(campaign.amountCollected >= campaign.target){
            campaign.status = CampaignStatus.Successful;
        } else {
            campaign.status = CampaignStatus.Failed;
        }
        emit CampaignFinalized(_campaignId, campaign.status);
    }


    // Function to cancel campaign
    // Owner can cancel only if nobody donated yet
    function cancelCampaign(uint256 _campaignId) public {
        require(_campaignId < numberOfCampaigns, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];
        // Safety checks
        require(msg.sender  == campaign.owner, "Only owner can cancel");
        // Only campaign that's active can be cancelled 
        require(campaign.status == CampaignStatus.Active, "Not active");
        require(campaign.amountCollected == 0, "Already Funded" );
            campaign.status = CampaignStatus.Cancelled;
            emit CampaignCancelled(_campaignId);
    }

    // Function to submit milestone proof
    function submitMilestoneProof(
        uint256 _campaignId,
        uint256 _milestoneId,
        string memory _ipfsHash
    ) public {
        require(_campaignId < numberOfCampaigns, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];
        // Safety checks
        require(msg.sender  == campaign.owner, "Only owner can submit proof");
        require(campaign.status == CampaignStatus.Successful, "Campaign not successful");
        require(_milestoneId < campaign.milestones.length, "Invalid milestone");

        Milestone storage milestone = campaign.milestones[_milestoneId];
        require(!milestone.proofSubmitted, "Proof already submitted");
        require(!milestone.approved, "Milestone already approved");
        require(!milestone.paid, "Milestone already paid");

        // Milestones must be paid in accordance
        require(_milestoneId == campaign.nextMilestoneToPay, "Pay previous milestones first");

        bytes memory hashBytes = bytes(_ipfsHash);
        require(hashBytes.length > 0, "Proof hash cannot be empty");

        milestone.proofHash = _ipfsHash;
        milestone.proofSubmitted = true;
        milestone.proofSubmittedAt = block.timestamp;

        emit ProofSubmitted(_campaignId, _milestoneId, _ipfsHash);
    }

    // Function to vote on milestones
    function voteOnMilestone(
        uint256 _campaignId,
        uint256 _milestoneId,
        bool _support
    ) public {
        require(_campaignId < numberOfCampaigns, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];

        //Ensure result is known before governance begins
        require(block.timestamp >= campaign.deadline, "Wait for deadline");
        if(campaign.status == CampaignStatus.Active){
            // allow lazy finalize
            if(campaign.amountCollected >= campaign.target) {
                campaign.status = CampaignStatus.Successful;
            } else {
                campaign.status = CampaignStatus.Failed;
            }
            emit CampaignFinalized(_campaignId, campaign.status);
        }
        // Safety Checks
        require(_milestoneId < campaign.milestones.length, "Invalid milestone");
        require(campaign.status == CampaignStatus.Successful, "Campaign not successful");

        Milestone storage milestone = campaign.milestones[_milestoneId];

        // Proof must be submitted before voting commences
        require(milestone.proofSubmitted, "Owner has not submitted proof yet");

        // Voting window check
        require(
            block.timestamp <= milestone.proofSubmittedAt + VOTING_WINDOW,
            "Voting window has closed"
        );

        require(!milestone.approved, "Milestone already approved");
        require(!milestone.paid, "Milestone already paid");

        //Checks through the ledger to see if a user is a contributor or not
        uint256 contribution = contributionOf[_campaignId][msg.sender];
        require(contribution > 0, "Must be a contributor to vote");

        // Double vote prevention
        require(!hasVoted[_campaignId][_milestoneId][msg.sender], "Already voted");
        hasVoted[_campaignId][_milestoneId][msg.sender] = true;

        // Weighted voting; Add the user donation amount to for/against
        if(_support) {
            milestone.votesFor += contribution;
        } else{
            milestone.votesAgainst += contribution;
        }

        emit MilestoneVoted(_campaignId, _milestoneId, msg.sender, _support, contribution);

        uint256 totalVotes = milestone.votesFor + milestone.votesAgainst;
        // Auto-approve when at least 50% of collected funds voted, and more yes-votes (in ETH terms) than no-votes
        if(
            totalVotes >= (campaign.amountCollected / 2) 
            && 
            milestone.votesFor > milestone.votesAgainst 
            && 
            !milestone.approved
            ) {
            milestone.approved = true;
        emit MilestoneApproved(_campaignId, _milestoneId);
        }
    }

    // Function for funds withdrawal from contract to creator 
    function withdrawMilestone(
        uint256 _campaignId,
        uint256 _milestoneId
        ) public nonReentrant {
            require(_campaignId < numberOfCampaigns, "Campaign does not exist");
            Campaign storage campaign = campaigns[_campaignId];
            require(msg.sender == campaign.owner, "Only campaign owner can withdraw");
            require(_milestoneId < campaign.milestones.length, "Invalid milestone");
        
        // Strong safety check
            Milestone storage milestone = campaign.milestones[_milestoneId];
            require(milestone.approved, "Milestone not approved");
            require(!milestone.paid, "Milestone already settled");
            // Check for the contract balance against the requested milestone amount
            require(address(this).balance >= milestone.amount, "Insufficient balance");
        // Mark as paid before sending the ether to prevent reentrancy attack
            milestone.paid = true;
            campaign.nextMilestoneToPay = _milestoneId + 1;
        //Sends the ether from the contract to the personal wallet
            (bool sent,) = payable(campaign.owner).call{value: milestone.amount}("");
            require(sent, "Failed to send Ether");

            emit MilestonePaid(_campaignId, _milestoneId, milestone.amount);
        }


    // Function to request refund if campaign fails
    function requestRefund(
        uint256 _campaignId
    ) public nonReentrant {
        require(_campaignId < numberOfCampaigns, "Campaign does not exist");
        Campaign storage campaign = campaigns[_campaignId];
        // Finalizes an active campaign but only if after the deadline has passed
        if (campaign.status == CampaignStatus.Active) {
            require(block.timestamp >= campaign.deadline, "Too early");
            if (campaign.amountCollected >= campaign.target) {
                campaign.status = CampaignStatus.Successful;
            } else {
                campaign.status = CampaignStatus.Failed;
            }
            emit CampaignFinalized(_campaignId, campaign.status);
        }
        
        require(
            campaign.status == CampaignStatus.Failed || campaign.status == CampaignStatus.Cancelled, "Refund conditions not met"
        );
        uint256 amount = contributionOf[_campaignId][msg.sender];
        require(amount > 0, "No contribution found");
            contributionOf[_campaignId][msg.sender] = 0;

            (bool sent,) = payable(msg.sender).call{value: amount}("");
            require(sent, "Failed to send refund");

            emit Refunded(_campaignId, msg.sender, amount);
    }

    // Function to get contract balance
    function getContractBalance() 
    public view returns (uint256) {
        return address(this).balance;
    }

    // Function to get all milestone details for a campaign
    function getMilestone(
        uint256 _campaignId,
        uint256 _milestoneId
    ) public view returns (
        string memory description,
        uint256 amount,
        string memory proofHash,
        bool proofSubmitted,
        bool approved,
        bool paid,
        uint256 votesFor,
        uint256 votesAgainst,
        uint256 votingDeadline

    ) {
        Milestone storage m = campaigns[_campaignId].milestones[_milestoneId];
        return (
        m.description,
        m.amount,
        m.proofHash,
        m.proofSubmitted,
        m.approved,
        m.paid,
        m.votesFor,
        m.votesAgainst,
        m.proofSubmitted ? m.proofSubmittedAt + VOTING_WINDOW : 0
        );
    }

    // Function to get campaign balance(amount collected minus paid milestones)
    function getCampaignBalance(
        uint256 _campaignId
    ) 
    public view returns (uint256) {
        Campaign storage campaign = campaigns[_campaignId];
        // Initialize the total milestone paid out
        uint256 totalPaid = 0;

        // Loops through to check all the milestone paid out and subtracts from the total amount raised 
        for(uint256 i = 0; i < campaign.milestones.length; i++){
            if(campaign.milestones[i].paid) {
                totalPaid += campaign.milestones[i].amount;
            }
        }
        return campaign.amountCollected - totalPaid;
    }
}


"use client";
import React, { useEffect, useState } from 'react';
import Web3Modal from "web3modal";
import { ethers } from 'ethers';

// Internal Import
import { CrowdFundingABI, CrowdFundingAddress } from './constant';

// --- Fetch smart contract ---
// Need to ask why there's no Curly braces
const fetchContract = (signerOrProvider) => 
    new ethers.Contract(CrowdFundingAddress, CrowdFundingABI, signerOrProvider);

export const CrowdFundingContext = React.createContext()
export const CrowdFundingProvider = ({ children }) => {
    const titleData = "Crowdfunding Contract"
    const [currentAccount, setCurrentAccount] = useState("");

    // --- WALLET ---
    const checkIfWalletIsConnected = async () => {
        try {
            // ---- Silent Check
            //  (Stop the operation if the user does not have any of the wallet listed below) ----
            if(!window.ethereum)
                return console.log("Please install metamask or Rabby");

            const accounts = await window.ethereum.request({
                // --- This method interacts with metamask and checks 
                // if the user has previously authorized for the website 
                // to see their address
                // A list or an array of an address is returned ---
                method:"eth_accounts"
            });

            // --- After metamask then confirms if the address is in the list
            // If yes it grabs the first address in the list and stores it in the React State using the setCurrentAccount variable
            if(accounts.length){
                setCurrentAccount(accounts[0]);
            } else {
                console.log("No account found");
            }
            // This block executes if the steps above fail/Do not meet the condition
        } catch(error){
            console.log("Error connecting wallet:", error);
        }
    } 

    const connectWallet = async () => {
        try {
            if(!window.ethereum)
                return console.log("Please install metamask or Rabby");

            const accounts = await window.ethereum.request({
                method:"eth_requestAccounts"
            });
            setCurrentAccount(accounts[0]);
        } catch (err) {
            console.log("Error connecting wallet:", err)
        }
    };

     useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    const disconnectWallet = () => {
        setCurrentAccount("");
    };

     // ---- HELPER FUNCTIONS
     const getContract = async () => {
        // Web3Modal provides users modals to be able to connect their wallet 
        const web3modal = new Web3Modal();
        const connection = await Web3Modal.connect();
        // Allows the code to read data from the blockchain
        const provider = new ethers.providers.Web3Provider(connection);
        // Allowing users to make changes onchain
        // Allows user to be able to initiate transactions
        const signer = provider.getSigner();

        return fetchContract(signer);
     };
    
    // ---- CAMPAIGN FUNCTIONS
    const createCampaign = async (campaign) => {
        const { title, description, target, deadline, milestoneDescriptions, milestoneAmounts } = campaign;
        try {
          const contract = await getContract();
          
          const transaction = await contract.createCampaign(
            currentAccount, // owner
            title,
            description,
            ethers.utils.parseEther(target.toString()), // convert ETH to wei
            new Date(deadline).getTime() / 1000,        // convert to unix timestamp
            milestoneDescriptions,                       // string[]
            milestoneAmounts.map(a =>                   // convert each amount to wei
                ethers.utils.parseEther(a.toString())
            )
          );
          await transaction.wait();
          console.log("Campaign created successfully");
        } catch(err) {
            console.log("Error creating campaign:", err);
        }
    }; 
    // This fetches all the campaigns created
    // Allows easy fetching of campaigns to display on the Next.JS frontend
    const getCampaigns = async () => {
        try {  
          const provider = new ethers.providers.JsonRpcProvider();
          const contract = fetchContract(provider);

          const totalCampaigns = await contract.numberOfCampaigns();
          const campaigns = [];

          for(let i = 0; i < totalCampaigns; i++) {
            const c = await contract.campaigns(i);
            campaigns.push({
                id: i,
                owner: c.owner,
                title: c.title,
                description: c.description,
                target: ethers.utils.formatEther(c.target.toString()),
                deadline: new Date(c.deadline.toNumber() * 1000).toLocaleDateString(),
                amountCollected: ethers.utils.formatEther(c.amountCollected.toString()),
                status: c.status,
            });
          }
          return campaigns;
        } catch(err) {
            console.log("Error fetching campaigns:", err)
        }
    }; 

    const donateToCampaign = async () => {
        try {  
          const contract = await getContract();

          const transaction = await contract.donateToCampaign(id, {
            value: ethers.utils.parseEther(amount.toString()),
          });

          await transaction.wait();
          console.log("Donation successful");
        } catch(err) {
            console.log("Error donating:", err)
        }
    }; 

    const finalizeCampaign = async (id) => {
        try {  
          const contract = await getContract();
          const transaction = await contract.finalizeCampaign(id);
          await transaction.wait();
          console.log("Campaign finalized");
        } catch(err) {
            console.log("Error finalizing campaign:", err)
        }
    }; 

    const cancelCampaign = async (id) => {
        try {  
          const contract = await getContract();
          const transaction = await contract.cancelCampaign(id);
          await transaction.wait();
          console.log("Campaign cancelled");
        } catch(err) {
            console.log("Error cancelling campaign:", err);
        }
    }; 

    // ---- MILESTONE FUNCTIONS
    const submitMilestoneProof = async (campaignId, milestoneId, ipfsHash) => {
        try {
            const contract = await getContract();
            const transaction = await contract.submitMilestoneProof(
                campaignId,
                milestoneId,
                ipfsHash
            );
            await transaction.wait();
            console.log("Proof submitted successfully");
        } catch(err) {
            console.log("Error submitting proof:", err);
    }

    }; 
    
    const voteOnMilestone = async (campaignId, milestoneId, support) => {
        try {
            const contract = await getContract();
            const transaction = await contract.voteOnMilestone(
                campaignId,
                milestoneId,
                support
            );
            await transaction.wait();
            console.log("Vote cast successfully");
        } catch(err) {
            console.log("Error voting:", err);
    }
    }; 

    const withdrawMilestone = async (campaignId, milestoneId) => {
        try {
            const contract = await getContract();
            const transaction = await contract.withdrawMilestone(
                campaignId,
                milestoneId
            );
            await transaction.wait();
            console.log("Withdrawal successful");
        } catch(err) {
            console.log("Error withdrawing:", err);
    }
    }; 

    const requestRefund = async (campaignId) => {
        try {
            const contract = await getContract();
            const transaction = await contract.requestRefund(campaignId);
            await transaction.wait();
            console.log("Refund successful");
        } catch(err) {
            console.log("Error requesting refund:", err);
    }
    }; 

    // --- EXPOSE APP
    return (
        <CrowdFundingContext.Provider
            value={{
                currentAccount,
                connectWallet,
                disconnectWallet,
                createCampaign,
                getCampaigns,
                donateToCampaign,
                finalizeCampaign,
                cancelCampaign,
                submitMilestoneProof,
                voteOnMilestone,
                withdrawMilestone,
                requestRefund
            }}
        >
            {children}
        </CrowdFundingContext.Provider>
    );
     
};

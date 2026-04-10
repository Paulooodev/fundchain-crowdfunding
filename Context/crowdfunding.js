"use client";
import React, { useEffect, useState } from 'react';
// import Web3Modal from "web3modal";
import { ethers } from 'ethers';
// Internal Import
import { CrowdFundingABI, CrowdFundingAddress } from './constant';

// --- Fetch smart contract ---
// Need to ask why there's no Curly braces
const fetchContract = (signerOrProvider) => 
    new ethers.Contract(CrowdFundingAddress, CrowdFundingABI, signerOrProvider);

export const CrowdFundingContext = React.createContext();

export const CrowdFundingProvider = ({ children }) => {
    const titleData = "Crowdfunding Contract"
    const [currentAccount, setCurrentAccount] = useState("");

    // --- WALLET ---
    const checkIfWalletIsConnected = async () => {
        try {
            // ---- Silent Check
            //  (Stop the operation if the user does not have any of the wallet listed below) ----
            if(!window.ethereum) return
            
            const accounts = await window.ethereum.request({
                // --- This method interacts with metamask and checks 
                // if the user has previously authorized for the website 
                // to see their address
                // A list or an array of an address is returned ---
                method:"eth_accounts"
                // return console.log("Please install metamask or Rabby");

            });

            // --- After metamask then confirms if the address is in the list
            // If yes it grabs the first address in the list and stores it in the React State using the setCurrentAccount variable
            if(accounts.length){
                setCurrentAccount(accounts[0]);
            }
            // This block executes if the steps above fail/Do not meet the condition
        } catch(error){
            console.log("checkIfWalletIsConnected error:", error);
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

    const disconnectWallet = () => {
        setCurrentAccount("");
    };

     useEffect(() => {
        checkIfWalletIsConnected();
        // Listen for account changes in MetaMask
        if(window.ethereum) {
            window.ethereum.on("accountsChanged", (accounts) => {
                if(accounts.length){
                setCurrentAccount(accounts[0]);
            } else setCurrentAccount("");
            })
        }
    }, []);


     // ---- HELPER FUNCTIONS(signer for write functions)
     const getSignerContract = async () => {
       if (!window.ethereum) throw new Error("MetaMask not found");
        // Allows the code to read data from the blockchain
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        // Allowing users to make changes onchain
        // Allows user to be able to initiate transactions
        const signer = provider.getSigner();

        return fetchContract(signer);
     };
    
    // ---- HELPER FUNCTIONS(provider for write functions)
    const getReadContract = () => {
        const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545");
        return fetchContract(provider)
    }
    // ---- CAMPAIGN FUNCTIONS
    const createCampaign = async (campaign) => {
        const { title, description, target, deadline, milestoneDescriptions, milestoneAmounts } = campaign;
        try {
          const contract = await getSignerContract();
          
          const transaction = await contract.createCampaign(
            currentAccount, // owner
            title,
            description,
            ethers.utils.parseEther(target.toString()), // convert ETH to wei
            Math.floor(new Date(deadline).getTime() / 1000),        // convert to unix timestamp
            milestoneDescriptions,                       // string[]
            milestoneAmounts.map(a =>                   // convert each amount to wei
                ethers.utils.parseEther(a.toString())
            )
          );
          await transaction.wait();
          console.log("Campaign created successfully:", transaction.hash);
        } catch(err) {
            console.log("Error creating campaign:", err);
        }
    }; 
    // This fetches all the campaigns created
    // Allows easy fetching of campaigns to display on the Next.JS frontend
    const getCampaigns = async (id) => {
        try {  
          const contract = getReadContract();

          const totalCampaigns = await contract.numberOfCampaigns();
          const campaigns = [];

          for(let i = 0; i < Number(totalCampaigns); i++) {
            const c = await contract.campaigns(i);
            campaigns.push({
                id: i,
                owner: c.owner,
                title: c.title,
                description: c.description,
                target: ethers.utils.formatEther(c.target.toString()),
                deadline: new Date(c.deadline.toNumber() * 1000).toLocaleDateString(),
                amountCollected: ethers.utils.formatEther(c.amountCollected.toString()),
                status: Number(c.status),
                nextMilestoneToPay: Number(c.nextMilestoneToPay),
            });
          }
          return campaigns;
        } catch(err) {
            console.log("Error fetching campaigns:", err)
        }
    }; 

    const getCampaignById = async (id) => {
        try {
            const contract = getReadContract();
            const c = await contract.campaigns(id);
            return {
                id: Number(id),
                owner: c.owner,
                title: c.title,
                description: c.description,
                target: ethers.formatEther(c.target.toString()),
                deadline: new Date(Number(c.deadline) * 1000).toLocaleDateString(),
                deadlineRaw: Number(c.deadline),
                amountCollected: ethers.formatEther(c.amountCollected.toString()),
                status: Number(c.status),
                nextMilestoneToPay: Number(c.nextMilestoneToPay),
            };
        } catch (error) {
            console.log("getCampaignById error:", error);
        }
    };


    const donateToCampaign = async (id, amount) => {
        try {  
          const contract = await getSignerContract();

          const transaction = await contract.donateToCampaign(id, {
            value: ethers.utils.parseEther(amount.toString()),
          });

          await transaction.wait();
          console.log("Donation successful", transaction.hash);
          return transaction;
        } catch(err) {
            console.log("Error donating:", err)
        }
    }; 

    const finalizeCampaign = async (id) => {
        try {  
          const contract = await getSignerContract();
          const transaction = await contract.finalizeCampaign(id);
          await transaction.wait();
          console.log("Campaign finalized");
        } catch(err) {
            console.log("Error finalizing campaign:", err);
            throw err;
        }
    }; 

    const cancelCampaign = async (id) => {
        try {  
          const contract = await getSignerContract();
          const transaction = await contract.cancelCampaign(id);
          await transaction.wait();
          console.log("Campaign cancelled");
        } catch(err) {
            console.log("Error cancelling campaign:", err);
            throw err;
        }
    }; 

    // ---- MILESTONE FUNCTIONS
    const getMilestoneDetails = async (campaignId, milestoneId) => {
        try {
            const contract = getReadContract();
            const m = await contract.getMilestone(campaignId, milestoneId);
            return {
                description: m[0],
                amount: ethers.formatEther(m[1].toString()),
                proofHash: m[2],
                proofSubmitted: m[3],
                approved: m[4],
                paid: m[5],
                votesFor: ethers.formatEther(m[6].toString()),
                votesAgainst: ethers.formatEther(m[7].toString()),
                votingDeadline: Number(m[8]),
            };
        } catch (error) {
            console.log("getMilestoneDetails error:", error);
        }
    };

    const submitMilestoneProof = async (campaignId, milestoneId, ipfsHash) => {
        try {
            const contract = await getSignerContract();
            const transaction = await contract.submitMilestoneProof(
                campaignId,
                milestoneId,
                ipfsHash
            );
            await transaction.wait();
            console.log("Proof submitted successfully");
        } catch(err) {
            console.log("Error submitting proof:", err);
            throw err;
    }

    }; 
    
    const voteOnMilestone = async (campaignId, milestoneId, support) => {
        try {
            const contract = await getSignerContract();
            const transaction = await contract.voteOnMilestone(
                campaignId,
                milestoneId,
                support
            );
            await transaction.wait();
            return transaction;
        } catch(err) {
            console.log("Error voting:", err);
    }
    }; 

    const withdrawMilestone = async (campaignId, milestoneId) => {
        try {
            const contract = await getSignerContract();
            const transaction = await contract.withdrawMilestone(
                campaignId,
                milestoneId
            );
            await transaction.wait();
            return transaction
        } catch(err) {
            console.log("Error withdrawing:", err);
            throw err;
    }
    }; 

    const requestRefund = async (campaignId) => {
        try {
            const contract = await getContract();
            const transaction = await contract.requestRefund(campaignId);
            await transaction.wait();
            return transaction;
        } catch(err) {
            console.log("Error requesting refund:", err);
            throw err;
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
                getCampaignById,
                getMilestoneDetails,
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

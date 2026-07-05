"use client"
import React, { useEffect, useState, useContext }  from 'react'
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Badge } from '@/components/ui/badge';
import { ethers } from 'ethers';
import { CrowdFundingAddress, CrowdFundingABI } from '../../../Context/constant';

// --- Medal colors for top 3 
const medalConfig = {
    0: { bg: "bg-chart-5/10", text:"text-chart-5", border: "border-chart-5/30", icon: "solar:medal-star-bold", label: "GOLD" },
    1: { bg: "bg-muted/40", text:"text-muted-foreground", border: "border-border", icon: "solar:medal-ribbons-star-bold", label: "SILVER" },
    2: { bg: "bg-chart-3/10", text:"text-chart-3", border: "border-chart-3/30", icon: "solar:medal-ribbon-bold", label: "BRONZE" },
}


const shortenAddress = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

// Format relative time
const getRelativeTime = (timestamp) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;
    if (diff < 60) return "just now";
    if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000)  return `${Math.floor(diff / 86400)}d ago`;
    return new Date(timestamp * 1000).toLocaleDateString();
}

const TopDonors = ({ campaignId, currentAccount }) => {
    const [donors, setDonors] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [totalDonations, setTotalDonations] = useState(0);

    useEffect(() => {
        const loadDonors = async () => {
            try {
                setIsLoading(true);
                const provider = new ethers.providers.JsonRpcProvider(
                    process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545"
                );
                console.log("RPC URL being used:", process.env.NEXT_PUBLIC_RPC_URL);
                const contract = new ethers.Contract(
                    CrowdFundingAddress,
                    CrowdFundingABI,
                    provider
                );

                // Fetch all DonationReceived events for this campaign
                const filter = contract.filters.DonationReceived(campaignId);

                const DEPLOYMENT_BLOCK = 10678393;
                const events = await contract.queryFilter(filter, DEPLOYMENT_BLOCK, "latest");

                console.log("Total events found:", events.length);
                setTotalDonations(events.length);

                // Aggregating donations per donor -- A single donor may have contributed multiple times we can sum them up
                const donorMap = new Map();

                for(const event of events){
                    const donor = event.args.donor.toLowerCase();
                    const amount = parseFloat(ethers.utils.formatEther(event.args.amount));
                    const block = await event.getBlock();
                    const timestamp = block.timestamp;

                    if (donorMap.has(donor)) {
                        const existing = donorMap.get(donor);
                        donorMap.set(donor, {
                            address: donor,
                            totalAmount: existing.totalAmount + amount,
                            donationCount: existing.donationCount + 1,
                            firstDonation: Math.min(existing.firstDonation, timestamp),
                            latestDonation: Math.max(existing.latestDonation, timestamp),
                            latestTxHash: timestamp > existing.latestDonation
                                ? event.transactionHash
                                : existing.latestTxHash
                        });
                    } else {
                        donorMap.set(donor, {
                            address: donor,
                            totalAmount: amount,
                            donationCount: 1,
                            firstDonation: timestamp,
                            latestDonation: timestamp,
                            latestTxHash: event.transactionHash,
                        })
                    }
                }
                /*
                    If i'm trying to understand the above i guess we are trying to get every donor details such as amount, 
                    block where the tx took place, the timestamp of the tx. Then a conditional statement to check and store store donors with the highest amount contributed
                    checking if they have donated before so as to add them to the leaderboard provided they amongst the top 10 leaderboard.
                */

                // Sort descending by total amount ( top 10 donors)
                const sorted = Array.from(donorMap.values())
                    .sort((a, b) => b.totalAmount - a.totalAmount)
                    .slice(0, 10);
                    setDonors(sorted);
            } catch(err) {
                console.log("loadDonors error:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (campaignId !== undefined) loadDonors()
    }, [campaignId]);

    // Loading skeleton
    if(isLoading) return (
        <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-5">
                <div className="h-5 w-40 rounded bg-secondary animate-pulse" />
            </div>
            <div className="flex flex-col gap-3">
                {[0, 1, 2].map(i => (
                    <div key={i} className="h-14 rounded-lg bg-secondary animate-pulse" />
                ))}
            </div>
        </div>
    )
  return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-xl border border-border bg-card p-5"
    >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
                <Icon icon="solar:ranking-bold" className="size-5 text-primary" />
                <h3 className="text-lg font-semibold">Top Donors</h3>
            </div>
            {totalDonations > 0 && (
                <Badge
                    className="bg-primary/10 text-primary border-primary/20"   
                >
                    {totalDonations} total {totalDonations === 1 ? "donation" : "donations"}
                </Badge>
            )}
        </div>

        {/* Empty state / No donation */}
        {donors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                    <div className="w-14 h-14 rounded-full bg-secondary flex items-center justify-center">
                        <Icon icon="solar:heart-bold" className="size-6 text-muted-foreground" />
                    </div>
                    <div>
                        <p className="font-medium text-foreground">No donations yet</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Be the first to back this campaign.
                        </p>
                    </div>
                </div>
        ) : (
            <div className="flex flex-col gap-2">
                <AnimatePresence>
                   {donors.map((donor, index) => {
                    const isCurrentUser = currentAccount &&
                        donor.address === currentAccount.toLowerCase();
                        const isTop3 = index < 3;
                        const medal = isTop3 ? medalConfig[index] : null;

                        return (
                           <motion.div
                                    key={donor.address}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`flex items-center gap-3 rounded-lg p-3 transition-all ${
                                        isCurrentUser
                                            ? "bg-primary/5 border border-primary/30"
                                            : isTop3 && medal
                                            ? `${medal.bg} border ${medal.border}`
                                            : "bg-secondary/30 border border-border"
                                    }`}
                            >
                                {/* Rank */}
                                <div className="shrink-0 w-8 flex items-center justify-center">
                                        {isTop3 && medal ? (
                                            <Icon icon={medal.icon} className={`size-6 ${medal.text}`} />
                                        ) : (
                                            <span className="text-sm font-bold text-muted-foreground">
                                                #{index + 1}
                                            </span>
                                        )}
                                    </div>

                                    {/* Donor Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-medium text-foreground truncate">
                                                {shortenAddress(donor.address)}
                                            </p>
                                            {isCurrentUser && (
                                                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
                                                    You
                                                </Badge>
                                            )}
                                            {donor.donationCount > 1 && (
                                                <Badge className="bg-muted/40 text-muted-foreground border-border text-xs">
                                                    {donor.donationCount}x
                                                </Badge>
                                            )}
                                        </div>
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                        <Icon icon="solar:clock-circle-bold" className="size-3" />
                                        <span>{getRelativeTime(donor.latestDonation)}</span>
                                         <span className="mx-1">·</span> 
                                         <a 
                                            href={`https://sepolia.etherscan.io/tx/${donor.latestTxHash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:text-primary hover:underline inline-flex items-center gap-1"
                                         >
                                            <Icon icon="solar:link-bold" className="size-3" />
                                                Verify
                                            </a> 
                                    </div>
                                    </div>

                                    {/* Amount */}
                                    <div className="text-right shrink-0">
                                        <p className={`text-sm font-bold ${isTop3 && medal ? medal.text : "text-foreground"}`}>
                                            {donor.totalAmount.toFixed(4)} ETH
                                        </p>
                                    </div>
                            </motion.div>
                        )
                   })}  
                </AnimatePresence>
            </div>
        )}
    </motion.div>
  )
}

export default TopDonors
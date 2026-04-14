"use client"
import React, { useEffect, useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { CrowdFundingContext } from '../../../../Context/crowdfunding';
import { useParams, useRouter } from 'next/navigation';

// ── Status config ───── 

const statusConfig = {
    0: { label: "Active",     color: "bg-accent/10 text-accent border-accent/20",                   icon: "solar:play-circle-bold" },
    1: { label: "Successful", color: "bg-primary/10 text-primary border-primary/20",                icon: "solar:check-circle-bold" },
    2: { label: "Failed",     color: "bg-destructive/10 text-destructive border-destructive/20",    icon: "solar:close-circle-bold" },
    3: { label: "Cancelled",  color: "bg-muted/40 text-muted-foreground border-border",             icon: "solar:forbidden-circle-bold" },
};

// ── Milestone status ────
const getMilestoneStatus = (m) => {
    if (m.paid)           return { label: "Paid",        color: "bg-accent/10 text-accent border-accent/20",             icon: "solar:check-circle-bold" };
    if (m.approved)       return { label: "Approved",    color: "bg-primary/10 text-primary border-primary/20",          icon: "solar:shield-check-bold" };
    if (m.proofSubmitted) return { label: "Voting Open", color: "bg-chart-5/10 text-chart-5 border-chart-5/20",          icon: "solar:users-group-rounded-bold" };
    return                { label: "pending proof",      color: "bg-muted/40 text-muted-foreground border-border",       icon: "solar:clock-circle-bold"}
}

// ── Countdown ────
const getTimeLeft = (deadlineRaw) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = deadlineRaw - now;
    if(diff <= 0) return "Ended";
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
};

// Shorten address
const short = (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";

// ── Main Page ─────
const CampaignDetailPage = () => {
    const params = useParams();
    const router  = useRouter();
    const id      = params?.id;

    const {
        currentAccount,
        getCampaignById,
        getMilestoneDetails,
        donateToCampaign,
        finalizeCampaign,
        cancelCampaign,
        submitMilestoneProof,
        voteOnMilestone,
        withdrawMilestone,
        requestRefund,
    } = useContext(CrowdFundingContext);

    const [campaign, setCampaign] = useState(null);
    const [milestones, setMilestones] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [txLoading, setTxLoading] = useState("");

    // Donate
    const [donateAmount, setDonateAmount] = useState("");
    const [donateError, setDonateError] = useState("");

    // Proof Modal
    const [proofModal, setProofModal] = useState(false)
    const [proofTarget, setProofTarget] = useState(null);
    const [ipfsHash, setIpfsHash] = useState("");
    const [ipfsError, setIpfsError] = useState("");

    // ── Fetch ────
    const load = async () => {
        if(!id) return 
        try {
            setIsLoading(true);
            const numericId = Number(id);
            console.log("Loading campaign id:", id);
            const c = await getCampaignById(id);
            if (!c) {
                setCampaign(null);
                return;
            }
            setCampaign(c);
            // Fetch all milestones for this campaign
            // We need to know how many — read from campaign struct via a loop
            // until we hit an out-of-range error

            const mList = [];
            let i = 0;
            while(true){
                try {
                    console.log("Fetching milestone:", i);
                    const m = await getMilestoneDetails(id, i);
                    console.log("Milestone result:", m);
                    if(!m) break;
                    mList.push({...m, index: i })
                    i++;
                } catch(err) {
                    console.log("Milestone loop broke at index:", i, err.message);
                    break;
                }
            }
            setMilestones(mList);
        } catch(error) {
            console.log("Error loading campaign:", error);
        } finally {
            console.log("Setting isLoading false");
            setIsLoading(false);
        }
    }
     useEffect(() => {
        if (!id) return;
        load();
    }, [id]);


    // ── Actions ────
    const handleDonate = async() => {
        if(!donateAmount || isNaN(donateAmount) || Number(donateAmount) <= 0) {
            setDonateError("Enter a valid ETH amount");
            return
        }
        try {
            setTxLoading("donate");
            await donateToCampaign(id, donateAmount);
            setDonateAmount("");
            await load();
        } catch (e) {
            console.log(e);
        } finally {
            setTxLoading("");
        }
    };

    const handleFinalize = async () => {
        try {
            setTxLoading("finalize");
            await finalizeCampaign(id);
            await load();
        } catch (e) { console.log(e); }
        finally { setTxLoading(""); }
    };

    const handleCancel = async () => {
        try {
            setTxLoading("cancel");
            await cancelCampaign(id);
            await load();
        } catch (e) { console.log(e); }
        finally { setTxLoading(""); }
    };

    const handleSubmitProof = async () => {
        if(!ipfsHash.trim()) { setIpfsError("IPFS hash cannot be empty"); return; }
        try {
            setTxLoading("proof");
            await submitMilestoneProof(id, proofTarget, ipfsHash.trim());
            setProofModal(false);
            setIpfsHash("");
            setProofTarget(null);
            await load();
        } catch(e) { console.log(e); }
        finally { setTxLoading(""); }
    };

    const handleVote = async (milestoneIndex, support) => {
        try {
            setTxLoading(`vote_${milestoneIndex}`);
            await voteOnMilestone(id, milestoneIndex, support);
            await load();
        } catch (e) { console.log(e); }
        finally { setTxLoading(""); }
    }

    const handleWithdraw = async (milestoneIndex) => {
        try {
            setTxLoading(`withdraw_${milestoneIndex}`);
            await withdrawMilestone(id, milestoneIndex);
            await load();
        } catch (e) { console.log(e); }
        finally { setTxLoading(""); }
    };

    const handleRefund = async () => {
        try {
            setTxLoading("refund");
            await requestRefund(id);
            await load();
        } catch (e) { console.log(e); }
        finally { setTxLoading(""); }
    };

    const isOwner = currentAccount && 
        campaign?.owner?.toLowerCase() === currentAccount.toLowerCase();

    // ── Loading skeleton ────
     if (isLoading) return (
        <div className="min-h-screen bg-background pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-4xl animate-pulse flex flex-col gap-6">
                <div className="h-8 w-2/3 rounded bg-secondary" />
                <div className="h-4 w-full rounded bg-secondary" />
                <div className="h-4 w-5/6 rounded bg-secondary" />
                <div className="h-40 rounded-xl bg-secondary" />
                <div className="h-64 rounded-xl bg-secondary" />
            </div>
        </div>
    );

    if(!campaign) return (
        <div className="min-h-screen bg-background pt-24 pb-20 flex items-center justify-center">
            <div className="text-center">
                <Icon icon="solar:folder-open-bold" className="size-16 text-muted-foreground mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">Campaign not found</h2>
                <Button onClick={() => router.push("/campaigns")} variant="outline" className="mt-4 gap-2">
                    <Icon icon="solar:arrow-left-bold" className="size-4" />
                    Back to Campaigns
                </Button>
            </div>
        </div>
    );

    const progress = Math.min(
        (parseFloat(campaign.amountCollected) / parseFloat(campaign.target)) * 100,
        100
    );

    const status = statusConfig[campaign.status] || statusConfig[0];
    const isPastDeadline = Math.floor(Date.now() / 1000) >= campaign.deadlineRaw;

    return (
        <div className="min-h-screen ng-background pt-24 pb-20">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back link */}
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
                >
                    <Icon icon="solar:arrow-left-bold" className="size-4" />
                    Back to Campaigns
                </button>

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8"
                >
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <Badge className={status.color}>
                            <Icon icon={status.icon} className="size-3 mr-1" />
                            {status.label}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Icon icon="solar:clock-circle-bold" className="size-4" />
                            <span>{isPastDeadline ? "Deadline passed" : getTimeLeft(campaign.deadlineRaw)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Icon icon="solar:calendar-bold" className="size-4" />
                            <span>{campaign.deadline}</span>
                        </div>
                    </div>

                    <h1 className="font-heading text-3xl font-semibold tracking-tight mb-3">
                        {campaign.title}
                    </h1>
                    <p className="text-muted-foreground text-base leading-relaxed">
                        {campaign.description}
                    </p>

                    {/* Owner */}
                    <div className="flex items-center gap-2 mt-4">
                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                           <Icon icon="solar:user-bold" className="size-3.5 text-primary" /> 
                        </div>
                        <span className="text-sm text-muted-foreground">
                            Created by <span className="text-foreground font-medium">{short(campaign.owner)}</span>
                            {isOwner && <Badge className="ml-2 bg-primary/10 text-primary border-primary/20 text-xs">You</Badge>}
                        </span>
                    </div>
                </motion.div>

                {/* Funding progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <Card className="border-border bg-card mb-6">
                        <CardContent className="pt-6 flex flex-col gap-4">
                            <div className="flex items-end justify-between">
                               <div>
                                  <p className="text-3xl font-bold tracking-tight">
                                    {parseFloat(campaign.amountCollected).toFixed(4)} ETH
                                  </p>  
                                  <p className="text-sm text-muted-foreground mt-1">
                                    raised of {parseFloat(campaign.target).toFixed(4)} ETH
                                  </p>  
                               </div>
                               <p className="text-2xl font-bold text-primary">
                                    {progress.toFixed(1)}%
                                </p>
                            </div>
                             <Progress value={progress} className="h-2" />

                             {/* Stats row */}
                             <div className="grid grid-cols-3 gap-4 pt-2 border-t border-border">
                                <div className="text-center">
                                    <p className="text-lg font-bold">{milestones.length}</p>
                                    <p className="text-xs text-muted-foreground">Milestones</p>
                                </div>
                                <div className="text-center border-x border-border">
                                    <p className="text-lg font-bold">
                                        {milestones.filter(m => m.paid).length}
                                    </p> 
                                    <p className="text-xs text-muted-foreground">Milestones Paid</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-primary">
                                        {campaign.status === 0 ? "Active" : status.label}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Status</p>
                                </div>
                             </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* ACTIONS */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="mb-8"
                >
                    {/* Donate - to be shown when campaign is active */}
                    {campaign.status === 0 && !isOwner && (
                        <Card className="border-border bg-card mb-4">
                            <CardContent className="pt-5">
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                    <Icon icon="solar:heart-bold" className="size-4 text-primary" />
                                    Back this Campaign
                                </h3>
                                <div className="flex gap-3">
                                    <div className="relative flex-1">
                                        <Icon 
                                            icon="fa6-brands:ethereum" 
                                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" 
                                        />
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.001"
                                            placeholder="Amount in ETH"
                                            value={donateAmount}
                                            onChange={e => { setDonateAmount(e.target.value); setDonateError(""); }}
                                            className="w-full rounded-lg border border-border bg-secondary text-foreground pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                        />
                                    </div>
                                        <Button
                                            onClick={handleDonate}
                                            disabled={txLoading === "donate"}
                                            className="gap-4 bg-gradient-to-br from-primary to-primary/90 shadow-lg shadow-primary/20 shrink-0"
                                        >
                                            {txLoading === "donate" ? (
                                                <Icon icon="solar:refresh-bold" className="size-4 animate-spin" />
                                            ) : (
                                                <Icon icon="solar:heart-bold" className="size-4" />      
                                            )}
                                            Donate
                                        </Button>
                                    {donateError && (
                                        <p className="text-xs text-destructive mt-2 flex items-center gap-1">
                                          <Icon icon="solar:danger-circle-bold" className="size-3" />
                                            {donateError}  
                                        </p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                    {/* Owner actions */}
                    {isOwner && (
                        <div className="flex flex-wrap gap-3 mb-4">
                          {/* Finalize — after deadline, still Active */}
                          {campaign.status === 0 && isPastDeadline && (
                            <Button
                                    onClick={handleFinalize}
                                    disabled={txLoading === "finalize"}
                                    variant="outline"
                                    className="gap-2"
                                >
                                  {txLoading === "finalize"
                                        ? <Icon icon="solar:refresh-bold" className="size-4 animate-spin" />
                                        : <Icon icon="solar:flag-bold" className="size-4" />
                                  }
                                    Finalize Campaign
                                </Button>
                          )}
                          {/* Cancel - Active, no donations */}
                          {campaign.status === 0 && parseFloat(campaign.amountCollected) === 0 && (
                            <Button
                                    onClick={handleCancel}
                                    disabled={txLoading === "cancel"}
                                    variant="outline"
                                    className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                                >
                                    {txLoading === "cancel"
                                        ? <Icon icon="solar:refresh-bold" className="size-4 animate-spin" />
                                        : <Icon icon="solar:close-circle-bold" className="size-4" />
                                    }
                                    Cancel Campaign
                                </Button>
                          )}
                        </div>
                    )}
                       {/* Refund — Failed or Cancelled */}
                    {(campaign.status === 2 || campaign.status === 3) && !isOwner && (
                        <Card className="border-destructive/30 bg-destructive/5 mb-4">
                            <CardContent className="pt-5 flex items-center justify-between gap-4">
                                <div>
                                    <p className="font-semibold text-destructive">Campaign {status.label}</p>
                                    <p className="text-sm text-muted-foreground mt-0.5">
                                        You can claim a full refund of your contribution.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleRefund}
                                    disabled={txLoading === "refund"}
                                    className="gap-2 bg-destructive hover:bg-destructive/90 shrink-0"
                                >
                                    {txLoading === "refund"
                                        ? <Icon icon="solar:refresh-bold" className="size-4 animate-spin" />
                                        : <Icon icon="solar:arrow-left-bold" className="size-4" />
                                    }
                                    Claim Refund
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </motion.div>

              {/*  MILESTONE TIMELINE  */}  
              <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
                        <Icon icon="solar:flag-bold" className="size-5 text-primary" />
                        Milestone Timeline
                    </h2>
                      {milestones.length === 0 ?(
                        <p className="text-muted-foreground text-sm">No milestones found.</p>
                      ) : (
                        <div className="flex flex-col gap-4">
                            {milestones.map((m, i) => {
                                const mStatus = getMilestoneStatus(m);
                                const isNext = i === campaign.nextMilestoneToPay;
                                const votingOpen = m.proofSubmitted && !m.approved && !m.paid;
                                const votingEnded = m.votingDeadline > 0 &&
                                    Math.floor(Date.now() / 1000) > m.votingDeadline;
                                const totalVotes = parseFloat(m.votesFor) + parseFloat(m.votesAgainst);
                                const votePercent = totalVotes > 0
                                    ? (parseFloat(m.votesFor) / totalVotes) * 100
                                    : 0;
                                return (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 0.07 }}
                                        className={`rounded-xl border p-5 flex flex-col gap-4 transition-all ${
                                            isNext && campaign.status === 1
                                                ? "border-primary/40 bg-primary/5"
                                                : "border-border bg-card"
                                        }`}
                                    >
                                      {/* Milestone header */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                                    m.paid ? "bg-accent/20" :
                                                    m.approved ? "bg-primary/20" :
                                                    "bg-secondary"
                                                }`}>
                                                    <span className={`text-sm font-bold ${
                                                        m.paid ? "text-accent" :
                                                        m.approved ? "text-primary" :
                                                        "text-muted-foreground"
                                                    }`}>{i + 1}</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{m.description}</p>
                                                    <p className="text-sm text-muted-foreground mt-0.5">
                                                        {parseFloat(m.amount).toFixed(4)} ETH
                                                    </p>
                                                </div>
                                            </div>
                                            <Badge className={`${mStatus.color} shrink-0`}>
                                                <Icon icon={mStatus.icon} className="size-3 mr-1" />
                                                {mStatus.label}
                                            </Badge>
                                        </div>  
                                        {/* Proof link */}
                                        {m.proofSubmitted && m.proofHash && (
                                            <a
                                                href={`https://gateway.pinata.cloud/ipfs/${m.proofHash}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-sm text-primary hover:underline"
                                            >
                                                <Icon icon="solar:document-bold" className="size-4" />
                                                View Proof on IPFS
                                            </a>
                                        )}
                                        {/* Voting progress */}
                                        {votingOpen && (
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between text-xs text-muted-foreground">
                                                    <span>For: {parseFloat(m.votesFor).toFixed(4)} ETH</span>
                                                    <span>Against: {parseFloat(m.votesAgainst).toFixed(4)} ETH</span>
                                                </div>
                                                <Progress value={votePercent} className="h-1.5" />
                                                {m.votingDeadline > 0 && (
                                                    <p className="text-xs text-muted-foreground">
                                                        Voting closes: {new Date(m.votingDeadline * 1000).toLocaleDateString()}
                                                        {votingEnded ? " (Closed)" : ""}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {/* Action buttons */}
                                        <div className="flex flex-wrap gap-2">
                                          {/* Owner: submit proof */}
                                            {isOwner && campaign.status === 1 && isNext &&
                                             !m.proofSubmitted && !m.approved && !m.paid && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => { setProofTarget(i); setProofModal(true); }}
                                                    className="gap-2 bg-gradient-to-br from-primary to-primary/90"
                                                >
                                                    <Icon icon="solar:upload-bold" className="size-3.5" />
                                                    Submit Proof
                                                </Button>
                                            )} 

                                       {/* Donor: vote */}
                                            {!isOwner && votingOpen && !votingEnded && (
                                                <>
                                                    <Button
                                                        size="sm"
                                                        disabled={txLoading === `vote_${i}`}
                                                        onClick={() => handleVote(i, true)}
                                                        className="gap-2 bg-accent/90 hover:bg-accent text-white"
                                                    >
                                                        {txLoading === `vote_${i}`
                                                            ? <Icon icon="solar:refresh-bold" className="size-3.5 animate-spin" />
                                                            : <Icon icon="solar:check-circle-bold" className="size-3.5" />
                                                        }
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        disabled={txLoading === `vote_${i}`}
                                                        onClick={() => handleVote(i, false)}
                                                        className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Icon icon="solar:close-circle-bold" className="size-3.5" />
                                                        Reject
                                                    </Button>
                                                </>
                                            )}

                                          {/* Owner: withdraw */}
                                            {isOwner && m.approved && !m.paid && (
                                                <Button
                                                    size="sm"
                                                    disabled={txLoading === `withdraw_${i}`}
                                                    onClick={() => handleWithdraw(i)}
                                                    className="gap-2 bg-gradient-to-br from-accent to-accent/90"
                                                >
                                                    {txLoading === `withdraw_${i}`
                                                        ? <Icon icon="solar:refresh-bold" className="size-3.5 animate-spin" />
                                                        : <Icon icon="solar:wallet-bold" className="size-3.5" />
                                                    }
                                                    Withdraw {parseFloat(m.amount).toFixed(4)} ETH
                                                </Button>
                                            )}
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                      )}
                </motion.div>
            </div>

            {/* PROOF SUBMISSION MODAL */}
            <AnimatePresence>
                {proofModal && (
                   <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
                        onClick={() => setProofModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="bg-card border border-border rounded-2xl p-6 w-full max-w-md"
                            onClick={e => e.stopPropagation()}
                        >
                           <div className="flex items-center justify-between mb-5">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Icon icon="solar:upload-bold" className="size-5 text-primary" />
                                    Submit Milestone Proof
                                </h3>
                                <button
                                    onClick={() => setProofModal(false)}
                                    className="text-muted-foreground hover:text-foreground"
                                >
                                    <Icon icon="solar:close-circle-bold" className="size-5" />
                                </button>
                            </div> 
                            <p className="text-sm text-muted-foreground mb-4">
                                Upload your proof document to IPFS via{" "}
                                <a href="https://app.pinata.cloud" target="_blank" className="text-primary hover:underline">
                                    Pinata
                                </a>
                                , then paste the CID below. Donors will use this to verify completion before voting.
                            </p>

                            <div className="flex flex-col gap-1.5 mb-5">
                                <label className="text-sm font-medium text-foreground">
                                    IPFS CID / Hash
                                </label>
                                <div className="relative">
                                    <Icon icon="solar:link-bold"
                                        className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        placeholder="QmXyz..."
                                        value={ipfsHash}
                                        onChange={e => { setIpfsHash(e.target.value); setIpfsError(""); }}
                                        className="w-full rounded-lg border border-border bg-secondary text-foreground pl-10 pr-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    />
                                </div>
                                {ipfsError && (
                                    <p className="text-xs text-destructive flex items-center gap-1">
                                        <Icon icon="solar:danger-circle-bold" className="size-3" />
                                        {ipfsError}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <Button variant="outline" onClick={() => setProofModal(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSubmitProof}
                                    disabled={txLoading === "proof"}
                                    className="flex-1 gap-2 bg-gradient-to-br from-primary to-primary/90"
                                >
                                    {txLoading === "proof"
                                        ? <Icon icon="solar:refresh-bold" className="size-4 animate-spin" />
                                        : <Icon icon="solar:upload-bold" className="size-4" />
                                    }
                                    Submit
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default CampaignDetailPage;
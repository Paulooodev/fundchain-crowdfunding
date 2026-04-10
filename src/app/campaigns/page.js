"use client"
import React, { useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CrowdFundingContext } from '../../../Context/crowdfunding';
import Link from 'next/link';

// ── Status badge config ─────
const statusConfig = {
    0: { label: "Active",     color: "bg-accent/10 text-accent border-accent/20",         icon: "solar:play-circle-bold" },
    1: { label: "Successful", color: "bg-primary/10 text-primary border-primary/20",      icon: "solar:check-circle-bold" },
    2: { label: "Failed",     color: "bg-destructive/10 text-destructive border-destructive/20", icon: "solar:close-circle-bold" },
    3: { label: "Cancelled",  color: "bg-muted/40 text-muted-foreground border-border",   icon: "solar:forbidden-circle-bold" },
};

// ── Campaign Card ────
const CampaignCard = ({ campaign, index }) => {
    const progress = Math.min(
        (parseFloat(campaign.amountCollected) / parseFloat(campaign.target)) * 100,
        100
    );
    const status = statusConfig[campaign.status] || statusConfig[0];

    return(
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.08 }}
        >
          <Card className="h-full flex flex-col overflow-hidden border-border bg-card hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
            {/* Coloured top bar based on status */}
            <div
                className={
                    `h-1 w-full ${
                    campaign.status === 0 ? "bg-accent" :
                    campaign.status === 1 ? "bg-primary" :
                    campaign.status === 2 ? "bg-destructive" : "bg-muted"
                    }`}/>
                        <CardContent className="flex flex-col gap-4 pt-5 flex-1">
                           {/* Header row */}
                              <div className="flex items-start justify-between gap-2">
                                <Badge className={status.color}>
                                    <Icon icon={status.icon} className="size-3 mr-1" />
                                    {status.label}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                    <Icon icon="solar:calendar-bold" className="size-3" />
                                    <span>{campaign.deadline}</span>
                                </div>
                                </div>

                                {/* Title */}
                                <h3 className="text-lg font-semibold tracking-tight leading-snug line-clamp-2">
                                    {campaign.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-muted-foreground line-clamp-3 flex-1">
                                    {campaign.description}
                                </p>

                                {/* Progress */}
                                <div>
                                    <div className="flex items-center justify-between text-sm mb-2">
                                        <span className="font-semibold text-foreground">
                                            {parseFloat(campaign.amountCollected).toFixed(4)} ETH
                                        </span>
                                        <span className="text-muted-foreground">
                                            of {parseFloat(campaign.target).toFixed(4)} ETH
                                        </span>
                                    </div>
                                    <Progress value={progress} className="h-1.5" />
                                    <p className="text-xs text-muted-foreground mt-1.5">
                                        {progress.toFixed(1)}% funded
                                    </p>
                                </div>

                                {/* Owner */}
                                <div className="flex items-center gap-2 pt-1 border-t border-border">
                                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <Icon icon="solar:user-bold" className="size-3 text-primary" />
                                    </div>
                                    <span className="text-xs text-muted-foreground truncate">
                                        {`${campaign.owner.slice(0, 6)}...${campaign.owner.slice(-4)}`}
                                    </span>
                                </div>
                        </CardContent>

                       <CardFooter className="pt-0">
                        <Link href={`/campaigns/${index}`} className="w-full">
                            <Button className="w-full gap-2" variant="outline">
                                <Icon icon="solar:eye-bold" className="size-4" />
                                View Campaign
                            </Button>
                        </Link>
                    </CardFooter> 
            
          </Card>  
        </motion.div>
    )
}

// ── Skeleton loader ───────────
const SkeletonCard = () => (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4 animate-pulse">
        <div className="h-5 w-24 rounded-full bg-secondary" />
        <div className="h-5 w-3/4 rounded bg-secondary" />
        <div className="h-4 w-full rounded bg-secondary" />
        <div className="h-4 w-5/6 rounded bg-secondary" />
        <div className="h-2 w-full rounded-full bg-secondary mt-2" />
        <div className="h-9 w-full rounded-lg bg-secondary mt-2" />
    </div>
);

// ── Filter tabs ─────
const filters = [
    { label: "All",        value: "all" },
    { label: "Active",     value: "0" },
    { label: "Successful", value: "1" },
    { label: "Failed",     value: "2" },
];

const ListingPage = () => {
    const { getCampaigns } = useContext(CrowdFundingContext);

    const [campaigns, setCampaigns] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [activeFilter, setActiveFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    // Fetch on mount
    useEffect(() => {
        const load = async () => {
            try {
                setIsLoading(true);
                const data = await getCampaigns();
                setCampaigns(data || []);
                setFiltered(data || []);
            } catch (error) {
                console.log("Error loading campaigns:", error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

     // Filter + search
     useEffect(() => {
        let result = [...campaigns];

        if(activeFilter !== "all") {
            result = result.filter(c => String(c.status) === activeFilter);
        }

        if(search.trim()){
            result = result.filter(c =>
              c.title.toLowerCase().includes(search.toLowerCase()) || 
              c.description.toLowerCase().includes(search.toLowerCase()) 
            )
        }
        setFiltered(result);
     }, [activeFilter, search, campaigns])

  return (
    <div className="min-h-screen bg-background pt-24 pb-20">
        <div className="container mx-auto px-4">
            {/* Page header */}
            <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-12 text-center"
                >
                    <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-primary/10 border border-primary/20 px-4 py-2">
                        <Icon icon="solar:compass-bold" className="size-4 text-primary" />
                        <span className="text-sm font-medium text-primary">
                            All Campaigns
                        </span>
                    </div>
                      <h1 className="font-heading text-4xl font-semibold tracking-tight mb-3">
                        Explore Projects
                     </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Browse campaigns, review milestones, and back projects you believe in.
                    </p>
                </motion.div>

               {/* Search + filter bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 mb-10"
                >
                  {/* Search */}
                    <div className="relative flex-1">
                      <Icon
                            icon="solar:magnifer-bold"
                            className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground"
                        />
                        <input
                            type="text"
                            placeholder="Search campaigns..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full rounded-lg border border-border bg-secondary pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                        /> 
                    </div>

                    {/* Filter tabs */}
                    <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary p-1">
                        {filters.map(f => (
                            <button
                                key={f.value}
                                onClick={() => setActiveFilter(f.value)}
                                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                                    activeFilter === f.value
                                        ? "bg-primary text-white shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </motion.div>
                
                {/* Campaign count */}
                {!isLoading && (
                    <p className="text-sm text-muted-foreground mb-6">
                        Showing <span className="font-semibold text-foreground">{filtered.length}</span> campaign{filtered.length !== 1 ? "s" : ""}
                    </p>
                )}

               {/* Grid */}
                    {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    // Empty state
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center py-24 gap-4 text-center"
                    >
                        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                            <Icon icon="solar:folder-open-bold" className="size-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold">No campaigns found</h3>
                        <p className="text-muted-foreground max-w-sm">
                            {search
                                ? `No results for "${search}". Try a different search term.`
                                : "No campaigns match this filter yet. Be the first to launch one."
                            }
                        </p>
                        <Link href="/create-campaign">
                            <Button className="mt-2 gap-2 bg-gradient-to-br from-primary to-primary/90 shadow-lg shadow-primary/20">
                                <Icon icon="solar:rocket-bold" className="size-4" />
                                Start a Campaign
                            </Button>
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filtered.map((campaign, index) => (
                            <CampaignCard
                                key={campaign.id}
                                campaign={campaign}
                                index={index}
                            />
                        ))}
                    </div>
                )}
        </div>
    </div>
  )
};

export default ListingPage
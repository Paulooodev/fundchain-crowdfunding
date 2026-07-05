"use client"
import React from 'react'
import { motion } from "framer-motion";
import { Icon } from '@iconify/react';
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';

const Hero = () => {
  return (
    <section className='relative overflow-hidden pt-32 pb-20'>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10"></div>
            <div className="container relative mx-auto px-4">
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                className='mx-auto max-w-4xl text-center'>
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2.5 md:py-2">
                        <Icon icon='solar:shield-check-bold' className='size-4 text-primary flex-shrink-0'/>
                        <span className="md:text-xl text-base font-medium text-primary text-center leading-tight">
                            Secure. Transparent. Decentralized.
                        </span>
                    </div>
                    <h1 className="mb-6 text-4xl font-semibold tracking-tight md:text-8xl">
                        Fund Projects with{" "}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Milestone-Based
                        </span>{" "}
                        Smart Contracts
                    </h1>
                    
                    <p className="mb-10 text-lg text-muted-foreground md:text-xl">
                        Revolutionary blockchain crowdfunding platform where funds are released in stages
                        based on verified milestones. Complete transparency, enhanced accountability, and
                        secure transactions.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <Link href="/create-campaign">
                        <Button size="lg"className="h-14 px-10 bg-gradient-to-br from-primary to-primary/90 shadow-lg shadow-primary/20 cursor-pointer">
                            <Icon icon='solar:rocket-bold' className='size-6 mr-2'/>
                                Start a Campaign
                        </Button>
                        </Link>
                        <Link href="/campaigns">
                        <Button size="lg"className="h-14 px-10 bg-gradient-to-br from-primary to-primary/90 shadow-lg shadow-primary/20 cursor-pointer">
                            <Icon icon='solar:compass-bold' className='size-6 mr-2'/>
                                Explore Projects
                        </Button>
                        </Link>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                className='mt-20 grid gap-6 md:grid-cols-3'>
                    {/* Card one */}
                    <Card className='border-border/50 bg-card/50 backdrop-blur-sm'>
                        <CardContent className='flex flex-col items-center pt-6 text-center'>
                            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                                <Icon icon="solar:dollar-bold" className="size-10 text-primary" />
                            </div>
                            <div className="mb-2 text-4xl font-bold tracking-tight">
                                $10M+
                            </div>
                            <div className="text-xl text-muted-foreground">
                                Total Funds Raised
                            </div>
                        </CardContent>
                    </Card>
                    {/* Card two */}
                    <Card className='border-border/50 bg-card/50 backdrop-blur-sm'>
                        <CardContent className='flex flex-col items-center pt-6 text-center'>
                            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                                <Icon icon="solar:document-add-bold" className="size-10 text-accent" />
                            </div>
                            <div className="mb-2 text-4xl font-bold tracking-tight">
                                15
                            </div>
                            <div className="text-xl text-muted-foreground">
                                Active Campaigns
                            </div>
                        </CardContent>
                    </Card>
                    {/* Card three */}
                    <Card className='border-border/50 bg-card/50 backdrop-blur-sm'>
                        <CardContent className='flex flex-col items-center pt-6 text-center'>
                            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
                                <Icon icon="solar:users-group-rounded-bold" className="size-10 text-chart-4" />
                            </div>
                            <div className="mb-2 text-4xl font-bold tracking-tight">
                                150k+
                            </div>
                            <div className="text-xl text-muted-foreground">
                                Backers Worldwide
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
    </section>
  )
}

export default Hero
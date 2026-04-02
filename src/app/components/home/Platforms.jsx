"use client"
import React from 'react'
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card'; 
const Platforms = () => {
  return (
    <section id="features" className='py-20'>
        <div className="container mx-auto px-4">
            {/* Features cards */}
            <motion.div 
                initial={{ opacity: 0, y: 30 }}s
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
            className='mb-16 text-center'>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2">
                    <Icon icon="solar:star-bold" className="size-5 text-accent" />
                    <span className="font-medium text-accent">Platform Features</span>
                </div>
                <h2 className="font-heading mb-4 text-4xl font-semibold tracking-tight md:text-5xl">
                    Why Choose FundChain?
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                    Built on blockchain technology for maximum transparency, security, and trust between
                    creators and backers.
                </p>
            </motion.div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Feature Card One */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Card className="h-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                        <CardContent className="pt-6">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10">
                                <Icon icon="solar:chart-2-bold" className="size-8 text-primary" />
                            </div>
                            <h3 className="mb-3 text-2xl font-semibold tracking-tight">
                                Milestone-Based Funding
                            </h3>
                            <p className="text-xl text-muted-foreground">
                                Funds are released incrementally as project milestones are achieved and
                                verified, ensuring accountability and reducing risk.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Feature Card Two */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Card className="h-full border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                        <CardContent className="pt-6">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10">
                                <Icon icon="solar:shield-check-bold" className="size-8 text-accent" />
                            </div>
                            <h3 className="mb-3 text-2xl font-semibold tracking-tight">
                                Smart Contract Security
                            </h3>
                            <p className="text-xl text-muted-foreground">
                                All transactions are governed by audited smart contracts, providing immutable
                                records and automated execution.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Feature Card Three */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Card className="h-full border-chart-4/20 bg-gradient-to-br from-chart-4/5 to-transparent">
                        <CardContent className="pt-6">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10">
                                <Icon icon="solar:eye-bold" className="size-8 text-chart-4" />
                            </div>
                            <h3 className="mb-3 text-2xl font-semibold tracking-tight">
                                Complete Transparency
                            </h3>
                            <p className="text-xl text-muted-foreground">
                                Every transaction and milestone update is recorded on the blockchain, providing
                                full visibility to all stakeholders.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Feature Card Four */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Card className="h-full border-chart-5/20 bg-gradient-to-br from-chart-5/5 to-transparent">
                        <CardContent className="pt-6">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10">
                                <Icon icon="solar:global-bold" className="size-8 text-chart-5" />
                            </div>
                            <h3 className="mb-3 text-2xl font-semibold tracking-tight">
                                Global Access
                            </h3>
                            <p className="text-xl text-muted-foreground">
                                Support projects from anywhere in the world with cryptocurrency, removing
                                traditional banking barriers and fees.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Feature Card Five */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Card className="h-full border-chart-3/20 bg-gradient-to-br from-chart-3/5 to-transparent">
                        <CardContent className="pt-6">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10">
                                <Icon icon="solar:hand-money-bold" className="size-8 text-chart-3" />
                            </div>
                            <h3 className="mb-3 text-2xl font-semibold tracking-tight">
                                Refund Protection
                            </h3>
                            <p className="text-xl text-muted-foreground">
                                Automatic refunds if milestones aren't met, with community voting mechanisms for dispute resolution.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Feature Card Six */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Card className="h-full border-chart-2/20 bg-gradient-to-br from-chart-2/5 to-transparent">
                        <CardContent className="pt-6">
                            <div className="mb-4 flex size-14 items-center justify-center rounded-xl bg-primary/10">
                                <Icon icon="solar:bolt-bold" className="size-8 text-chart-2" />
                            </div>
                            <h3 className="mb-3 text-2xl font-semibold tracking-tight">
                                Low Transaction Fees
                            </h3>
                            <p className="text-xl text-muted-foreground">
                                Blockchain technology reduces intermediary costs, ensuring more funds go
                                directly to project creators.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </div>
    </section>
  )
}

export default Platforms
"use client"
import React from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Progress } from "@/components/ui/progress"
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Campaigns = () => {
  return (
    <section id="campaigns" className='py-20'>
        <div className="container mx-auto px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className='mb-16 text-center'
            >
            <div className="mb-4 inline-flex items-center gap-3 rounded-full bg-primary/10 border border-primary/20 px-4 py-2">
                <Icon icon="solar:fire-bold" className='size-4 text-primary'/>
                <span className="text-sm font-medium text-primary">
                    Featured Campaigns
                </span>
            </div>
            <h2 className="font-heading mb-4 text-4xl font-semibold tracking-tight md:text-5xl">
                Trending Projects
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Discover innovative projects seeking funding from the community.
            </p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                >
                    <Card className="overflow-hidden border-none pt-0">
                        {/* campaign image(To be changed later)  */}
                        <Image
                            src="https://wqnmyfkavrotpmupbtou.supabase.co/storage/v1/object/public/generation-assets/placeholder/landscape.png"
                            alt="Campaign"
                            width={600} 
                            height={400}
                            className="aspect-video w-full rounded-t-xl object-cover"
                        />
                        <CardContent>
                            <div className="mb-3 flex items-center gap-2">
                                {/* To be changed later */}
                                <Badge className="bg-primary/10 text-primary">Technology</Badge>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Icon icon="solar:clock-circle-bold" className='size-4'/>
                                    <span>12 days left</span>
                                </div>
                            </div>
                            {/* Campaign Title(to be changed later) */}
                            <h3 className="mb-2 text-xl font-semibold tracking-tight">
                                AI-Powered Learning Platform
                            </h3>
                            {/* Campaign description */}
                            <p className="mb-4 text-sm text-muted-foreground">
                                Revolutionary education technology using artificial intelligence to personalize
                                learning experiences for students worldwide.
                            </p>
                            <div className="mb-3">
                                <div className="mb-2 flex items-center justify-between text-sm">
                                    {/* Campaign amount collected (dynamic value) */}
                                    <span className="font-medium">$247,500 raised</span>
                                    {/* Campaign target (dynamic value) */}
                                    <span className="text-muted-foreground">of $350,000</span>
                                </div>
                                <Progress value={71} className="h-2" />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Icon icon="solar:users-group-rounded-bold" className='size-4'/>
                                    {/* Donors count (dynamic value) */}
                                    <span>1,247</span>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button className="w-full">
                                View Campaign
                            </Button>
                        </CardFooter>
                    </Card>    
                </motion.div>
                </div>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}s
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className='mt-10 text-center'
                >
                    <Button size='lg' variant='outline'>
                        <Icon icon="solar:compass-bold" className='size-5'/>
                        Explore All Campaigns
                    </Button>
                </motion.div>
        </div>
    </section>
  )
}

export default Campaigns
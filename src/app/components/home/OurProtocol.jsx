"use client"
import React from 'react'
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Card, CardContent } from '@/components/ui/card';

const HowItWorks = () => {
  return (
    <section id="our-protocol" className='py-20'>
      <div className="container mx-auto px-4">
         <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className='mb-16 text-center'
          >
           <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-2">
            <Icon icon="solar:lightbulb-bolt-bold" className='size-4 text-accent'/>
              <span className="text-sm font-medium text-accent">Our Protocol</span>
           </div>
            <h2 className="font-heading mb-4 text-4xl font-semibold tracking-tight md:text-5xl">
              Simple Process, Maximum Security
            </h2> 
            <p className="mx-auto max-w-2xl text-l text-muted-foreground">
              Launch or back a campaign in four easy steps with blockchain-powered transparency.
            </p>
        </motion.div>
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 md:grid-cols-2">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className='mb-16 text-center'
            >
                <Card className="relative h-full border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="absolute -left-4 -top-4 flex size-12 items-center justify-center rounded-full border-4 border-background bg-primary text-xl font-bold text-primary-foreground">
                    1
                  </div>
                  <CardContent 
                    className="pt-6"
                  >
                    <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-primary/10">
                      <Icon icon="solar:document-add-bold" className="size-8 text-primary" />
                    </div>
                    <h3 className="mb-3 text-2xl font-semibold tracking-tight">
                      Create Campaign
                    </h3>
                    <p 
                      className="text-muted-foreground"
                    >
                      Define your project goals, funding requirements, and detailed milestones. Set
                      up your smart contract parameters and timeline for each phase.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className='mb-16 text-center'
            >
                <Card className="relative h-full border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                  <div className="absolute -left-4 -top-4 flex size-12 items-center justify-center rounded-full border-4 border-background bg-accent text-xl font-bold text-accent-foreground">
                    2
                  </div>
                  <CardContent 
                    className="pt-6"
                  >
                    <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-accent/10">
                      <Icon icon="solar:wallet-bold" className="size-8 text-accent" />
                    </div>
                    <h3 className="mb-3 text-2xl font-semibold tracking-tight">
                      Connect & Fund
                    </h3>
                    <p 
                      className="text-muted-foreground"
                    >
                      Backers connect their crypto wallets and contribute funds. All transactions
                      are recorded on the blockchain for complete transparency and security.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>


            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className='mb-16 text-center'
            >
                <Card className="relative h-full border-chart-2/20 bg-gradient-to-br from-chart-2/5 to-transparent">
                  <div className="absolute -left-4 -top-4 flex size-12 items-center justify-center rounded-full border-4 border-background bg-chart-2 text-xl font-bold text-white">
                    3
                  </div>
                  <CardContent 
                    className="pt-6"
                  >
                    <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-chart-4/10">
                      <Icon icon="solar:hand-money-bold" className="size-8 text-chart-2" />
                    </div>
                    <h3 className="mb-3 text-2xl font-semibold tracking-tight">
                      Release Funds
                    </h3>
                    <p 
                      className="text-muted-foreground"
                    >
                      Upon milestone verification, smart contracts automatically release the
                      corresponding funds to creators. Full transparency maintained throughout.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className='mb-16 text-center'
            >
                <Card className="relative h-full border-chart-4/20 bg-gradient-to-br from-chart-4/5 to-transparent">
                  <div className="absolute -left-4 -top-4 flex size-12 items-center justify-center rounded-full border-4 border-background bg-chart-4 text-xl font-bold text-white">
                    4
                  </div>
                  <CardContent 
                    className="pt-6"
                  >
                    <div className="mb-4 flex size-16 items-center justify-center rounded-xl bg-chart-4/10">
                      <Icon icon="solar:checklist-minimalistic-bold" className="size-8 text-chart-4" />
                    </div>
                    <h3 className="mb-3 text-2xl font-semibold tracking-tight">
                      Achieve Milestones
                    </h3>
                    <p 
                      className="text-muted-foreground"
                    >
                      Project creators complete predefined milestones and submit proof of progress.
                      Community validators review and verify milestone completion.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
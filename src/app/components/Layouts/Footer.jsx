"use client"
import React from 'react'
import { useState } from 'react'
import { motion } from "framer-motion";
import { Icon } from '@iconify/react';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card";


const Footer = () => {
  return (
    <section
      className='py-20 bg-secondary/30'
      id='about'
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="font-heading mb-6 text-4xl font-semibold tracking-tight md:text-5xl">
                Ready to Launch Your Campaign?
            </h2>
            <p className="mb-10 text-lg text-muted-foreground">
              Join thousands of creators who are funding their projects with complete transparency
              and security.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                size='lg'
                className="bg-gradient-to-br from-primary to-primary/90 shadow-lg shadow-primary/20"
              >
                <Icon icon="solar:rocket-bold" className="size-5" />
                  Start Your Campaign
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Footer
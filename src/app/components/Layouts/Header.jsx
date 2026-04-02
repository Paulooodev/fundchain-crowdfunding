"use client"
import React, { useEffect } from 'react'
import { useState } from 'react'
import { useContext } from 'react';
import { CrowdFundingContext } from '../../../../Context/crowdfunding';
import { motion, AnimatePresence } from "framer-motion";
import { Music, Menu, X } from "lucide-react";
import { Icon } from '@iconify/react';
import Link from "next/link";
import { Button } from "@/components/ui/button"


const navLinks = [
    { name: "Features", href: "#features" },
    { name: "Campaigns", href: "#campaigns" },
    { name: "Our Protocol", href: "#our-protocol" },
    { name: "About", href: "#about" },
]


const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
    // From context
    const { connectWallet, disconnectWallet, currentAccount } = useContext(CrowdFundingContext)

    // Shorten the address for easy display 
    const shortenAddress = (address) => 
        `${address.slice(0, 6)}...${address.slice(-4)}`

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])
  return (
        <nav 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
                isScrolled
                ? "h-16 border-b border-border bg-background/80 backdrop-blur-lg"
                : "h-16 border-b border-border"
            }`}>
            <div className="container mx-auto gap-3 flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Icon icon="solar:wallet-bold" className='size-8 text-primary'/>
                    <Link 
                        href="/" 
                        className="text-3xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold tracking-tight cursor-pointer"
                    >
                        FundChain
                    </Link>
                </div>
                <div className='hidden md:flex items-center gap-8'>
                    {navLinks.map((link) => (
                    <Link
                            key={link.name}
                            href={link.href}
                            className='text-md font-medium text-muted-foreground transition-colors hover:text-foreground'
                    >
                        {link.name}
                    </Link>
                    ))}
                </div>
                <div className="flex items-center gap-4">
                    {currentAccount ? (
                        <div className="relative">
                            <Button 
                                size='lg' 
                                className="bg-gradient-to-br from-primary to-primary/90 shadow-lg shadow-primary/20 cursor-pointer"
                                // 👇 Added onClick to toggle the menu open and closed
                                onClick={() => setIsDropdownMenuOpen(!isDropdownMenuOpen)}
                            >
                                <Icon icon="solar:wallet-bold" className='size-4'/>
                                {shortenAddress(currentAccount)}
                            </Button>

                            <div className={`absolute right-0 top-full mt-2 w-40 flex-col bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50 ${isDropdownMenuOpen ? 'flex' : 'hidden'}`}>
                                <button
                                    onClick={() => {
                                        disconnectWallet();
                                        setIsDropdownMenuOpen(false);
                                    }}
                                    className="px-4 py-3 text-sm text-left text-red-400 hover:bg-muted transition-colors"
                                >
                                    Disconnect
                                </button>
                            </div>
                        </div>
                        ) : (
                        <Button 
                            size='lg' 
                            className="bg-gradient-to-br from-primary to-primary/90 shadow-lg shadow-primary/20 cursor-pointer"
                            onClick={() => connectWallet()}
                        >
                            <Icon icon="solar:wallet-bold" className='size-4'/>
                            Connect Wallet
                        </Button>
                        )
                    }

                    <button 
                        className="md:hidden p-2 text-gray-400 hover:text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                        {mobileMenuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="absolute top-full left-0 right-0 bg-background/80 border-b border-white/5 p-6 md:hidden flex flex-col gap-4"
                        >
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className="text-lg font-bold hover:text-primary"
                            >
                                {link.name}
                            </Link>
                        ))}
                        </motion.div>
                    )}
                </AnimatePresence>
        </nav>
  )
}

export default Header
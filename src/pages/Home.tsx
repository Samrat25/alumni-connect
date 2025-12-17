import React from 'react';
import LandingHero from '@/components/Home/LandingHero';
import { RoleSelector } from '@/components/RoleSelector';
import { useWallet } from '@/contexts/WalletContext';
import Navbar from '@/components/Navbar';
import Features from '@/components/Home/Features';
import WorkProcess from '@/components/Home/WorkProcess';
import Footer from '@/components/Footer';



const Home = () => {
    const { connected } = useWallet();
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      {/* <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-verifier/5 blur-3xl animate-float" />
      </div> */}

      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        {!connected ? (
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero */}
            <LandingHero />

            {/* Features */}
            <Features />

            {/* How it works */}
            <WorkProcess />
          </div>
        ) : (
          <RoleSelector />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Home


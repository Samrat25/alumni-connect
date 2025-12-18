import React, { useEffect } from 'react';
import Lenis from 'lenis';
import LandingHero from '@/components/Home/LandingHero';
import { RoleSelector } from '@/components/RoleSelector';
import { useWallet } from '@/contexts/WalletContext';
import Navbar from '@/components/Navbar';
import Features from '@/components/Home/Features';
import WorkProcess from '@/components/Home/WorkProcess';
import Footer from '@/components/Footer';



const Home = () => {
    const { connected } = useWallet();

    useEffect(() => {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      function raf(time: number) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }

      requestAnimationFrame(raf);

      return () => {
        lenis.destroy();
      };
    }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <Navbar />

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        {!connected ? (
          <div className="max-w-7xl mx-auto">
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


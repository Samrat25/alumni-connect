import React from "react";
import { WalletButton } from '@/components/WalletButton';
import { ThemeToggle } from '@/components/ThemeToggle';

import {
  GraduationCap,
} from 'lucide-react';

const Navbar = () => {
  return (
    <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg">ChainRefer</h1>
            <p className="text-xs text-muted-foreground">
              Alumni Referral Protocol
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <WalletButton />
        </div>
      </div>
    </header>
  );
};

export default Navbar;

import React from "react";
import { WalletButton } from '@/components/WalletButton';
import { ThemeToggle } from '@/components/ThemeToggle';
import { NavLink } from '@/components/NavLink';

import {
  GraduationCap,
} from 'lucide-react';

const Navbar = () => {
  return (
    <header className="fixed top-0 mx-auto z-40 w-full h-16 pt-6">
      <div className="fixed top-0 left-0 right-0 h-24 bg-gradient-to-b from-background via-background/50 to-transparent pointer-events-none z-0"></div>
      <div className="container px-4 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm gradient-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-secondary" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-2xl">ChainRefer.</h1>
          </div>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2 mt-2 flex items-center space-x-8 bg-secondary px-5 py-[10px] rounded-md border">
          <NavLink 
            to="/" 
            className="text-md font-medium text-muted-foreground hover:text-foreground transition-colors"
            activeClassName="text-primary font-semibold"
          >
            Home
          </NavLink>
          <NavLink 
            to="/about" 
            className="text-md font-medium text-muted-foreground hover:text-foreground transition-colors"
            activeClassName="text-primary font-semibold"
          >
            About
          </NavLink>
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

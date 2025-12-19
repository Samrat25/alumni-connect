import React from "react";
import { GraduationCap, Mail } from "lucide-react";
import { NavLink } from "./NavLink";

const Footer = () => {
  return (
    <footer className="relative z-10 mt-auto px-20 py-12">
      <div className="flex flex-col md:flex-row gap-6 min-h-[500px] shadow-sm shadow-glow/10">
        {/* Left Box - Primary Color */}
        <div className="w-full md:w-[35%] bg-[#1a7861] p-12 flex flex-col justify-between rounded-md border shadow-md shadow-gray-600/20">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-sm bg-background flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-primary-foreground" />
              </div>
              <h2 className="font-bold text-background text-4xl">
                ChainRefer.
              </h2>
            </div>
            <div className="space-y-1 mb-8">
              <p className="text-primary-foreground/90 text-lg font-medium">
                Blockchain-Powered Referrals
              </p>
              <p className="text-accent-foreground text-md leading-tight tracking-tight">
                Verified resumes and trustworthy referrals based on transparent on-chain credentials.
              </p>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-accent-foreground text-sm uppercase tracking-wider">
              Built with trust on
            </p>
            <p className="text-background font-semibold text-2xl">
              Aptos Blockchain
            </p>
          </div>
        </div>

        {/* Right Box - Background Color */}
        <div className="w-full md:w-[65%] bg-background border rounded-md p-12 shadow-md shadow-gray-600/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            {/* Top Left - Links and Contact */}
            <div className="flex items-start justify-between gap-12">
              <div>
                <h3 className="text-foreground font-semibold mb-4">Links</h3>
                <nav className="space-y-2">
                  <NavLink
                    to="/"
                    className="block text-muted-foreground hover:text-foreground transition-colors text-md"
                  >
                    Home
                  </NavLink>
                  <NavLink
                    to="/about"
                    className="block text-muted-foreground hover:text-foreground transition-colors text-md"
                  >
                    About
                  </NavLink>
                  <a
                    href="#features"
                    className="block text-muted-foreground hover:text-foreground transition-colors text-md"
                  >
                    Features
                  </a>
                  <a
                    href="#how-it-works"
                    className="block text-muted-foreground hover:text-foreground transition-colors text-md"
                  >
                    How It Works
                  </a>
                </nav>
              </div>
              <div>
                <h3 className="text-foreground font-semibold mb-4">Contact Info</h3>
                <div className="space-y-2 text-md text-muted-foreground">
                  <p>Email: hello@chainrefer.io</p>
                  <p>Location: Decentralized</p>
                </div>
              </div>
            </div>

            {/* Top Right - Logo */}
            <div className="flex justify-end">
              <div className="w-24 h-24 rounded-xl bg-secondary/10 border rotate-[30deg] flex items-center justify-center transform translate-x-4 -translate-y-4 shadow-md shadow-slate-200/20">
                <GraduationCap className="w-16 h-16 text-primary -rotate-[36deg]" />
              </div>
            </div>

            {/* Bottom Left - Newsletter */}
            <div className="flex items-end gap-4">
              <div className="w-full">
                <h3 className="text-foreground font-semibold mb-3 text-md">
                  Stay Updated
                </h3>
                <div className="flex  gap-2">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="flex-1 px-4 py-3 bg-card border border-border rounded-lg text-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
                  />
                  <button className="px-6 py-2 bg-primary text-background rounded-lg text-md font-semibold hover:opacity-90 transition-opacity">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Right - Copyright */}
            <div className="flex items-end justify-end">
              <p className="text-sm text-muted-foreground">
                Built with 💚 by Team COSMO BLOCKS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

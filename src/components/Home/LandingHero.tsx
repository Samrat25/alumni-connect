import React from "react";
import { motion } from "motion/react";
import { WalletButton } from '../WalletButton';
import {
  Shield,
  Link2,
  Users,
  CheckCircle,
  Blocks,
  GraduationCap,
} from "lucide-react";

const LandingHero = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-16"
    >
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
        <Blocks className="w-4 h-4" />
        Powered by Aptos Blockchain
      </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
        Trustless Referrals for{" "}
        <span className="gradient-text">Verified Talent</span>
      </h1>
      <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
        A decentralized platform where students get their resumes verified
        on-chain, and alumni provide trustworthy referrals based on transparent
        credentials.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <WalletButton />
        <p className="text-sm text-muted-foreground">
          Connect with Petra Wallet to get started
        </p>
      </div>
    </motion.div>
  );
};

export default LandingHero;

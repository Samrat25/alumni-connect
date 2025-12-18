import React from "react";
import { motion } from "framer-motion";
import { WalletButton } from "../WalletButton";
import { useTheme } from "@/contexts/ThemeContext";
import {
  Blocks
} from "lucide-react";

const LandingHero = () => {
  const { theme } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-36 mt-24 w-full text-center"
    >
      <div className="upperHero container mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-4 py-[6px] rounded-full bg-[#248f74]/5 text-primary text-sm font-medium mb-6 border">
          <Blocks className="w-4 h-4" />
          Powered by Aptos Blockchain
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
          <span className="gradient-text2">Trustless</span> Referrals{" "}
          <span className="gradient-text3"> for</span> <br />{" "}
          <span className="gradient-text2">Verified </span>Talent
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 tracking-tight">
          A decentralized platform where students get their resumes verified
          on-chain and alumni provide trustworthy referrals based on transparent
          credentials.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <WalletButton />
          <p className="text-sm text-muted-foreground/20 tracking-tight">
            Connect with Petra Wallet to get started
          </p>
        </div>

        <div className="lowerHero w-screen relative left-[50%] right-[50%] -mx-[50vw] bg-[url(/Gradient-bg.png)] bg-no-repeat bg-cover bg-center min-h-[750px] px-24 pb-0 flex items-end">
        <div className="w-full h-[650px] rounded-xl overflow-hidden border-[12px] border-background/20 bg-background mt-44">
          <img src={theme === 'dark' ? '/P1.png' : '/P2.png'} alt="Product Preview" className="w-full h-full object-cover object-top" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-72 bg-gradient-to-t from-background via-background/50 to-transparent pointer-events-none"></div>
      </div>
      </div>

      
    </motion.div>
  );
};

export default LandingHero;

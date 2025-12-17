import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Loader2, Globe, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { WalletConnectModal } from './WalletConnectModal';

export function WalletButton() {
  const { connected, address, connecting, connect, disconnect, network } = useWallet();
  const [showModal, setShowModal] = useState(false);

  const truncateAddress = (addr: string | null) => {
    if (!addr || typeof addr !== 'string') return 'Invalid Address';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const openExplorer = () => {
    if (address) {
      window.open(`https://explorer.aptoslabs.com/account/${address}?network=devnet`, '_blank');
    }
  };

  if (connected && address) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2"
      >
        {/* Network Badge */}
        <div className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium",
          network === 'Devnet' 
            ? "bg-success/10 text-success border border-success/20"
            : "bg-warning/10 text-warning border border-warning/20"
        )}>
          <Globe className="w-3 h-3" />
          {network || 'Unknown'}
        </div>

        {/* Address */}
        <button
          onClick={openExplorer}
          className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-card border border-border hover:border-primary/50 transition-colors group"
        >
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            {truncateAddress(address)}
          </span>
          <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
        </button>

        {/* Disconnect */}
        <Button variant="ghost" size="icon" onClick={disconnect} className="h-8 w-8">
          <LogOut className="w-4 h-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <>
      <Button
        variant="gradient"
        onClick={() => setShowModal(true)}
        disabled={connecting}
        className="gap-2 rounded-md border border-primary/30 py-3 text-sm font-medium hover:border-primary/50 transition-colors"
      >
        {connecting ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Wallet className="w-4 h-4" />
        )}
        {connecting ? 'Connecting...' : 'Connect Petra Wallet'}
      </Button>

      <WalletConnectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConnect={connect}
      />
    </>
  );
}

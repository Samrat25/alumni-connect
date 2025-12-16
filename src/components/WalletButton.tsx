import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function WalletButton() {
  const { connected, address, connecting, connect, disconnect } = useWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (connected && address) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3"
      >
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/10 border border-success/20">
          <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-sm font-medium text-foreground">
            {truncateAddress(address)}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={disconnect}>
          <LogOut className="w-4 h-4" />
        </Button>
      </motion.div>
    );
  }

  return (
    <Button
      variant="gradient"
      onClick={connect}
      disabled={connecting}
      className="gap-2"
    >
      {connecting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Wallet className="w-4 h-4" />
      )}
      {connecting ? 'Connecting...' : 'Connect Petra Wallet'}
    </Button>
  );
}

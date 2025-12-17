import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, ExternalLink, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: () => Promise<void>;
}

export function WalletConnectModal({ isOpen, onClose, onConnect }: WalletConnectModalProps) {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'initial' | 'connecting' | 'success'>('initial');

  useEffect(() => {
    if (!isOpen) {
      setStep('initial');
      setError(null);
      setConnecting(false);
    }
  }, [isOpen]);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    setStep('connecting');

    try {
      console.log('Modal: Initiating connection...');
      await onConnect();
      console.log('Modal: Connection successful!');
      setStep('success');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Modal: Connection error:', err);
      if (err.message?.includes('not found') || err.message?.includes('install')) {
        window.open('https://petra.app/', '_blank');
        setError('Petra Wallet not found. Please install the Petra extension and refresh the page.');
      } else if (err.message?.includes('rejected') || err.message?.includes('User')) {
        setError('Connection request was rejected. Please try again.');
      } else {
        setError(err.message || 'Failed to connect wallet. Please try again.');
      }
      setStep('initial');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-6 border-b border-border">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Connect Wallet</h2>
                    <p className="text-sm text-muted-foreground">Connect to Petra Wallet</p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {step === 'initial' && (
                  <>
                    {/* Petra Wallet Option */}
                    <button
                      onClick={handleConnect}
                      disabled={connecting}
                      className="w-full p-4 rounded-xl border-2 border-border hover:border-primary/50 bg-card hover:bg-accent/5 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF5F5F] to-[#FF3B3B] flex items-center justify-center">
                            <Wallet className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-foreground">Petra Wallet</div>
                            <div className="text-xs text-muted-foreground">
                              Click to connect
                            </div>
                          </div>
                        </div>
                        <ExternalLink className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                    </button>

                    {/* Info Box */}
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-primary/10 border border-primary/20">
                      <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-primary mb-1">Ready to Connect</p>
                        <p className="text-muted-foreground">
                          Clicking above will open Petra's popup. You'll need to approve the connection and sign transactions when prompted.
                        </p>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                          <p className="font-medium text-destructive mb-1">Connection Failed</p>
                          <p className="text-muted-foreground">{error}</p>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {step === 'connecting' && (
                  <div className="py-8 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <div className="text-center">
                      <p className="font-semibold text-foreground mb-1">Waiting for Approval</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Check your Petra Wallet popup
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Approve the connection request to continue
                      </p>
                    </div>
                  </div>
                )}

                {step === 'success' && (
                  <div className="py-8 flex flex-col items-center justify-center gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-8 h-8 text-success" />
                    </motion.div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground mb-1">Connected!</p>
                      <p className="text-sm text-muted-foreground">
                        Your wallet is now connected
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {step === 'initial' && (
                <div className="px-6 pb-6">
                  <div className="text-xs text-center text-muted-foreground">
                    By connecting, you agree to our Terms of Service
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

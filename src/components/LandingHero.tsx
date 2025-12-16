import { motion } from 'framer-motion';
import { WalletButton } from './WalletButton';
import { RoleSelector } from './RoleSelector';
import { useWallet } from '@/contexts/WalletContext';
import {
  Shield,
  Link2,
  Users,
  CheckCircle,
  Blocks,
  GraduationCap,
} from 'lucide-react';

const features = [
  {
    icon: Shield,
    title: 'Verified Credentials',
    description: 'Resume authenticity verified on Aptos blockchain',
  },
  {
    icon: Link2,
    title: 'Transparent Process',
    description: 'Every action recorded with immutable proof',
  },
  {
    icon: Users,
    title: 'Trust Network',
    description: 'Connect with verified alumni for referrals',
  },
];

export function LandingHero() {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/4 w-[800px] h-[800px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/4 w-[800px] h-[800px] rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] rounded-full bg-verifier/5 blur-3xl animate-float" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-card/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bold text-foreground text-lg">ChainRefer</h1>
              <p className="text-xs text-muted-foreground">Alumni Referral Protocol</p>
            </div>
          </div>
          <WalletButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        {!connected ? (
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero */}
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
                Trustless Referrals for{' '}
                <span className="gradient-text">Verified Talent</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
                A decentralized platform where students get their resumes verified on-chain,
                and alumni provide trustworthy referrals based on transparent credentials.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <WalletButton />
                <p className="text-sm text-muted-foreground">
                  Connect with Petra Wallet to get started
                </p>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid sm:grid-cols-3 gap-6 mb-16"
            >
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* How it works */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-card rounded-2xl p-8 border border-border/50"
            >
              <h2 className="text-2xl font-bold text-foreground mb-8">How It Works</h2>
              <div className="grid sm:grid-cols-3 gap-8">
                {[
                  {
                    step: '01',
                    title: 'Student Uploads',
                    description: 'Resume PDF uploaded, hash stored on Aptos blockchain',
                    color: 'student',
                  },
                  {
                    step: '02',
                    title: 'Verifier Approves',
                    description: 'College authority verifies authenticity on-chain',
                    color: 'verifier',
                  },
                  {
                    step: '03',
                    title: 'Alumni Refers',
                    description: 'Trusted referrals based on verified credentials',
                    color: 'alumni',
                  },
                ].map((item, index) => (
                  <div key={item.step} className="text-center">
                    <div
                      className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-${item.color}/10`}
                    >
                      <span className={`text-2xl font-bold text-${item.color}`}>
                        {item.step}
                      </span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    {index < 2 && (
                      <div className="hidden sm:block absolute top-8 right-0 w-8 h-0.5 bg-border" />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        ) : (
          <RoleSelector />
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/50 bg-card/50 backdrop-blur-xl mt-auto">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            ChainRefer — Prototype Demo • Built on{' '}
            <span className="text-primary font-medium">Aptos</span>
          </p>
        </div>
      </footer>
    </div>
  );
}

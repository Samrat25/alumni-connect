import { useWallet, WalletProvider } from '@/contexts/WalletContext';
import { LandingHero } from '@/components/LandingHero';
import { StudentDashboard } from '@/components/student/StudentDashboard';
import { VerifierDashboard } from '@/components/verifier/VerifierDashboard';
import { AlumniDashboard } from '@/components/alumni/AlumniDashboard';
import { WalletButton } from '@/components/WalletButton';
import { GraduationCap, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { setRole } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setRole(null)}
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-foreground text-lg">ChainRefer</h1>
                <p className="text-xs text-muted-foreground">Alumni Referral Protocol</p>
              </div>
            </button>
          </div>
          <WalletButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

function AppContent() {
  const { connected, role } = useWallet();

  if (!connected || !role) {
    return <LandingHero />;
  }

  return (
    <DashboardLayout>
      {role === 'student' && <StudentDashboard />}
      {role === 'verifier' && <VerifierDashboard />}
      {role === 'alumni' && <AlumniDashboard />}
    </DashboardLayout>
  );
}

const Index = () => {
  return (
    <WalletProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            color: 'hsl(var(--foreground))',
          },
        }}
      />
      <AppContent />
    </WalletProvider>
  );
};

export default Index;

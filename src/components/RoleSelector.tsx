import { motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { UserRole } from '@/lib/types';
import { GraduationCap, ShieldCheck, Briefcase, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const roles = [
  {
    id: 'student' as UserRole,
    title: 'Student',
    description: 'Upload your resume, get verified, and apply for referrals',
    icon: GraduationCap,
    color: 'student',
    gradient: 'from-student to-primary',
  },
  {
    id: 'verifier' as UserRole,
    title: 'Resume Verifier',
    description: 'College authority to verify student resumes on-chain',
    icon: ShieldCheck,
    color: 'verifier',
    gradient: 'from-verifier to-primary',
  },
  {
    id: 'alumni' as UserRole,
    title: 'Alumni',
    description: 'Post jobs and provide referrals to verified students',
    icon: Briefcase,
    color: 'alumni',
    gradient: 'from-alumni to-info',
  },
];

export function RoleSelector() {
  const { setRole, isVerifier, address } = useWallet();

  const handleRoleSelect = (roleId: UserRole) => {
    if (roleId === 'verifier' && !isVerifier) {
      // In production, this would check against the actual verifier address
      // For prototype, we'll allow it but show a warning
      console.warn('This wallet is not the designated verifier');
    }
    setRole(roleId);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold text-foreground mb-3">
          Select Your Role
        </h2>
        <p className="text-muted-foreground">
          Choose how you want to interact with the platform
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {roles.map((role, index) => {
          const Icon = role.icon;
          const isDisabled = role.id === 'verifier' && !isVerifier && address;
          
          return (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleRoleSelect(role.id)}
              disabled={!!isDisabled}
              className={cn(
                'group relative p-6 rounded-2xl bg-card border-2 border-border/50',
                'hover:border-transparent hover:shadow-xl transition-all duration-300',
                'text-left overflow-hidden',
                isDisabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {/* Gradient background on hover */}
              <div
                className={cn(
                  'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                  `bg-gradient-to-br ${role.gradient}`
                )}
                style={{ opacity: 0.05 }}
              />

              {/* Icon container */}
              <div
                className={cn(
                  'w-14 h-14 rounded-xl flex items-center justify-center mb-4',
                  'transition-all duration-300 group-hover:scale-110',
                  `bg-${role.color}/10`
                )}
              >
                <Icon className={cn('w-7 h-7', `text-${role.color}`)} />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
                {role.title}
                <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {role.description}
              </p>

              {/* Warning for verifier */}
              {role.id === 'verifier' && !isVerifier && address && (
                <p className="text-xs text-warning mt-3">
                  Your wallet is not the designated verifier
                </p>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

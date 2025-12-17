import { motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { UserRole } from '@/lib/types';
import { storage } from '@/lib/storage';
import {
  GraduationCap,
  ShieldCheck,
  Briefcase,
  ChevronRight,
} from 'lucide-react';
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

  // Check if this wallet is already registered as a student
  const isRegisteredStudent = address ? !!storage.getStudent(address) : false;

  // Check if this wallet has posted jobs (is alumni)
  const isRegisteredAlumni = address
    ? storage.getJobs().some((job) => job.postedBy === address)
    : false;

  const getRoleStatus = (roleId: UserRole) => {
    if (!address) return { disabled: false, message: null };

    // Verifier role restrictions
    if (roleId === 'verifier') {
      if (!isVerifier) {
        return {
          disabled: true,
          message: '⚠️ Your wallet is not authorized as a verifier',
          type: 'error',
        };
      }
      if (isRegisteredStudent) {
        return {
          disabled: true,
          message: '⚠️ This wallet is registered as a student',
          type: 'error',
        };
      }
      if (isRegisteredAlumni) {
        return {
          disabled: true,
          message: '⚠️ This wallet is registered as alumni',
          type: 'error',
        };
      }
      return {
        disabled: false,
        message: '✓ Authorized verifier wallet',
        type: 'success',
      };
    }

    // Student role restrictions
    if (roleId === 'student') {
      if (isVerifier) {
        return {
          disabled: true,
          message: '⚠️ Verifier wallets cannot register as students',
          type: 'error',
        };
      }
      if (isRegisteredAlumni) {
        return {
          disabled: true,
          message: '⚠️ This wallet is already registered as alumni',
          type: 'error',
        };
      }
      if (isRegisteredStudent) {
        return {
          disabled: false,
          message: '✓ Continue as registered student',
          type: 'success',
        };
      }
      return { disabled: false, message: null };
    }

    // Alumni role restrictions
    if (roleId === 'alumni') {
      if (isVerifier) {
        return {
          disabled: true,
          message: '⚠️ Verifier wallets cannot register as alumni',
          type: 'error',
        };
      }
      if (isRegisteredStudent) {
        return {
          disabled: true,
          message: '⚠️ This wallet is already registered as a student',
          type: 'error',
        };
      }
      if (isRegisteredAlumni) {
        return {
          disabled: false,
          message: '✓ Continue as alumni',
          type: 'success',
        };
      }
      return { disabled: false, message: null };
    }

    return { disabled: false, message: null };
  };

  const handleRoleSelect = (roleId: UserRole) => {
    const status = getRoleStatus(roleId);
    if (status.disabled) {
      return;
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
        {address && (
          <p className="text-xs text-muted-foreground mt-2">
            Connected: {address.slice(0, 6)}...{address.slice(-4)}
          </p>
        )}
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {roles.map((role, index) => {
          const Icon = role.icon;
          const status = getRoleStatus(role.id);

          return (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleRoleSelect(role.id)}
              disabled={status.disabled}
              className={cn(
                'group relative p-6 rounded-2xl bg-card border-2 border-border/50',
                'hover:border-transparent hover:shadow-xl transition-all duration-300',
                'text-left overflow-hidden',
                status.disabled && 'opacity-50 cursor-not-allowed'
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

              {/* Status message */}
              {status.message && (
                <p
                  className={cn(
                    'text-xs mt-3',
                    status.type === 'error' && 'text-destructive',
                    status.type === 'success' && 'text-success'
                  )}
                >
                  {status.message}
                </p>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Role separation info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 p-4 rounded-xl bg-muted/50 border border-border/50"
      >
        <p className="text-xs text-muted-foreground text-center">
          <strong className="text-foreground">Role Separation:</strong> Each
          wallet can only be used for ONE role. Students cannot be Alumni or
          Verifiers. Alumni cannot be Students or Verifiers. Use different
          wallets for different roles.
        </p>
      </motion.div>
    </div>
  );
}

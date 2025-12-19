import { motion } from "framer-motion";
import { useWallet } from "@/contexts/WalletContext";
import { UserRole } from "@/lib/types";
import { storage } from "@/lib/storage";
import {
  GraduationCap,
  ShieldCheck,
  Briefcase,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

const roles = [
  {
    id: "student" as UserRole,
    image: "/Student.png",
    title: "Student",
    description: "Upload your resume, get verified, and apply for referrals",
    icon: GraduationCap,
    color: "student",
    gradient: "from-student to-primary",
  },
  {
    id: "verifier" as UserRole,
    image: "/Verifier.png",
    title: "Resume Verifier",
    description: "College authority to verify student resumes on-chain",
    icon: ShieldCheck,
    color: "verifier",
    gradient: "from-verifier to-primary",
  },
  {
    id: "alumni" as UserRole,
    image: "/Alumni.png",
    title: "Alumni",
    description: "Post jobs and provide referrals to verified students",
    icon: Briefcase,
    color: "alumni",
    gradient: "from-alumni to-info",
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
    if (roleId === "verifier") {
      if (!isVerifier) {
        return {
          disabled: true,
          message: "⚠️ Your wallet is not authorized as a verifier",
          type: "error",
        };
      }
      if (isRegisteredStudent) {
        return {
          disabled: true,
          message: "⚠️ This wallet is registered as a student",
          type: "error",
        };
      }
      if (isRegisteredAlumni) {
        return {
          disabled: true,
          message: "⚠️ This wallet is registered as alumni",
          type: "error",
        };
      }
      return {
        disabled: false,
        message: "✓ Authorized verifier wallet",
        type: "success",
      };
    }

    // Student role restrictions
    if (roleId === "student") {
      if (isVerifier) {
        return {
          disabled: true,
          message: "⚠️ Verifier wallets cannot register as students",
          type: "error",
        };
      }
      if (isRegisteredAlumni) {
        return {
          disabled: true,
          message: "⚠️ This wallet is already registered as alumni",
          type: "error",
        };
      }
      if (isRegisteredStudent) {
        return {
          disabled: false,
          message: "✓ Continue as registered student",
          type: "success",
        };
      }
      return { disabled: false, message: null };
    }

    // Alumni role restrictions
    if (roleId === "alumni") {
      if (isVerifier) {
        return {
          disabled: true,
          message: "⚠️ Verifier wallets cannot register as alumni",
          type: "error",
        };
      }
      if (isRegisteredStudent) {
        return {
          disabled: true,
          message: "⚠️ This wallet is already registered as a student",
          type: "error",
        };
      }
      if (isRegisteredAlumni) {
        return {
          disabled: false,
          message: "✓ Continue as alumni",
          type: "success",
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
    <div className="w-full max-w-7xl mx-auto mt-32 mb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold  mb-4 leading-tight text-foreground">
          Select
          <span className="gradient-text3">Your</span>{" "}
          <span className="gradient-text2">Role</span>
        </h2>
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
                "group relative p-3 rounded-md bg-card border-2 border-border/50",
                "hover:border-transparent transition-all duration-300",
                "",
                status.disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="relative bg-background rounded-sm overflow-hidden border min-h-[400px] flex flex-col justify-end">
                {/* Image */}
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={role.image}
                    alt={role.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="relative z-10 text-left p-3">
                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-1 flex items-center gap-2">
                    {role.title}
                    <ChevronRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </h3>
                  <p className="text-sm max-w-sm text-popover-foreground leading-tight tracking-tight">
                    {role.description}
                  </p>

                  {/* Status message */}
                  {status.message && (
                    <div className="text-left w-fit h-fit border bg-card rounded-md px-1 py-1 mt-4">
                      <p
                        className={cn(
                          "text-xs",
                          status.type === "error" && "text-destructive",
                          status.type === "success" && "text-primary"
                        )}
                      >
                        {status.message}
                      </p>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background from-30% via-background/70 via-60% to-transparent pointer-events-none z-[1]" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Role separation info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 w-fit h-fit mx-auto p-4 rounded-md bg-muted/50 border border-border/50"
      >
        <p className="text-xs text-muted-foreground text-center">
          <strong className="text-primary">Role Separation:</strong> Each
          wallet can only be used for ONE role. Students cannot be Alumni or
          Verifiers. Alumni cannot be Students or Verifiers. Use different
          wallets for different roles.
        </p>
      </motion.div>
    </div>
  );
}

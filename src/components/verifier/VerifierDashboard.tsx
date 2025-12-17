import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { storage } from '@/lib/storage';
import { aptosTransactions, getExplorerUrl } from '@/lib/aptos';
import { Student } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { showTransactionToast, dismissToast } from '@/components/TransactionToast';
import {
  ShieldCheck,
  FileText,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  User,
  Mail,
  Building2,
  GraduationCap,
  Calendar,
  Hash,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function VerifierDashboard() {
  const { address, setRole, signAndSubmitTransaction } = useWallet();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<'verify' | 'reject' | null>(null);
  const [filter, setFilter] = useState<'all' | 'unverified' | 'verified' | 'rejected'>('unverified');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    const allStudents = Object.values(storage.getStudents()).filter(
      (s) => s.resumeHash
    );
    setStudents(allStudents);
  };

  const filteredStudents = students.filter((s) => {
    if (filter === 'all') return true;
    return s.resumeStatus === filter;
  });

  const handleVerify = async (approved: boolean) => {
    if (!address || !selectedStudent) return;

    setIsProcessing(true);
    setProcessingAction(approved ? 'verify' : 'reject');
    
    const toastId = showTransactionToast({
      type: 'pending',
      message: `Waiting for wallet signature to ${approved ? 'verify' : 'reject'} resume...`
    });

    try {
      // Sign transaction with Petra wallet - this will trigger Petra's popup
      const tx = approved
        ? await aptosTransactions.verifyResume(
            selectedStudent.walletAddress,
            selectedStudent.resumeHash || '',
            signAndSubmitTransaction,
            address
          )
        : await aptosTransactions.rejectResume(
            selectedStudent.walletAddress,
            selectedStudent.resumeHash || '',
            signAndSubmitTransaction,
            address
          );

      dismissToast(toastId);
      showTransactionToast({
        type: 'success',
        message: approved ? 'Resume verified on-chain!' : 'Resume rejected on-chain!',
        txHash: tx.hash
      });

      // Update local storage
      const updatedStudent: Student = {
        ...selectedStudent,
        resumeStatus: approved ? 'verified' : 'rejected',
        verifiedAt: new Date().toISOString(),
        verifiedBy: address,
        verificationTxHash: tx.hash,
      };

      storage.saveStudent(updatedStudent);
      loadStudents();
      setSelectedStudent(null);
    } catch (error: any) {
      dismissToast(toastId);
      showTransactionToast({
        type: 'error',
        message: error.message || 'Transaction failed'
      });
    } finally {
      setIsProcessing(false);
      setProcessingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => setRole(null)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-verifier" />
            Verifier Dashboard
          </h1>
          <p className="text-muted-foreground">
            Review and verify student resumes with signed transactions
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', count: students.length, filter: 'all' as const },
          { label: 'Pending', count: students.filter(s => s.resumeStatus === 'unverified').length, filter: 'unverified' as const },
          { label: 'Verified', count: students.filter(s => s.resumeStatus === 'verified').length, filter: 'verified' as const },
          { label: 'Rejected', count: students.filter(s => s.resumeStatus === 'rejected').length, filter: 'rejected' as const },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => setFilter(stat.filter)}
            className={cn(
              'p-4 rounded-xl border-2 transition-all text-left',
              filter === stat.filter
                ? 'border-verifier bg-verifier/5'
                : 'border-border/50 bg-card hover:border-verifier/50'
            )}
          >
            <p className="text-2xl font-bold text-foreground">{stat.count}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Student List */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Student Resumes
            </h3>
          </div>
          <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No resumes to review
              </div>
            ) : (
              filteredStudents.map((student) => (
                <motion.button
                  key={student.walletAddress}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => setSelectedStudent(student)}
                  className={cn(
                    'w-full p-4 text-left hover:bg-muted/50 transition-colors',
                    selectedStudent?.walletAddress === student.walletAddress &&
                      'bg-verifier/5'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {student.college} • {student.department}
                      </p>
                    </div>
                    <StatusBadge status={student.resumeStatus} />
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* Student Details */}
        <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border/50">
            <h3 className="font-semibold text-foreground">Student Details</h3>
          </div>
          {selectedStudent ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 space-y-6"
            >
              {/* Profile Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Name:</span>
                  <span className="font-medium text-foreground">{selectedStudent.name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium text-foreground">{selectedStudent.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">College:</span>
                  <span className="font-medium text-foreground">{selectedStudent.college}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <GraduationCap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Department:</span>
                  <span className="font-medium text-foreground">{selectedStudent.department}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Graduation:</span>
                  <span className="font-medium text-foreground">{selectedStudent.graduationYear}</span>
                </div>
              </div>

              {/* Resume Info */}
              <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Resume File</p>
                    <p className="font-medium text-foreground text-sm">
                      {selectedStudent.resumeFileName}
                    </p>
                  </div>
                  {selectedStudent.ipfsCid && (
                    <a
                      href={selectedStudent.ipfsUrl || `https://gateway.pinata.cloud/ipfs/${selectedStudent.ipfsCid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      View Resume
                    </a>
                  )}
                </div>
                
                {selectedStudent.ipfsCid && (
                  <div className="flex items-start gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">IPFS CID (Pinata)</p>
                      <code className="text-xs font-mono text-foreground break-all">
                        {selectedStudent.ipfsCid}
                      </code>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">On-chain Hash (SHA-256)</p>
                    <code className="text-xs font-mono text-foreground break-all">
                      {selectedStudent.resumeHash}
                    </code>
                  </div>
                </div>
                {selectedStudent.txHash && (
                  <div className="pt-2">
                    <p className="text-xs text-muted-foreground mb-1">Submission Transaction</p>
                    <a
                      href={getExplorerUrl(selectedStudent.txHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {selectedStudent.txHash.slice(0, 24)}...
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              {selectedStudent.resumeStatus === 'unverified' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <p className="text-xs text-muted-foreground">
                      <strong className="text-foreground">Signed Verification:</strong> Your decision will be recorded on Aptos Devnet with your wallet signature.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <Button
                      variant="success"
                      className="flex-1"
                      onClick={() => handleVerify(true)}
                      disabled={isProcessing}
                    >
                      {processingAction === 'verify' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Sign & Verify
                    </Button>
                    <Button
                      variant="destructive"
                      className="flex-1"
                      onClick={() => handleVerify(false)}
                      disabled={isProcessing}
                    >
                      {processingAction === 'reject' ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      Sign & Reject
                    </Button>
                  </div>
                </div>
              )}

              {selectedStudent.resumeStatus !== 'unverified' && (
                <div className="p-4 rounded-xl bg-muted/50 text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    This resume has been{' '}
                    <span className={cn(
                      'font-medium',
                      selectedStudent.resumeStatus === 'verified' ? 'text-success' : 'text-destructive'
                    )}>
                      {selectedStudent.resumeStatus}
                    </span>
                  </p>
                  {selectedStudent.verifiedAt && (
                    <p className="text-xs text-muted-foreground">
                      on {new Date(selectedStudent.verifiedAt).toLocaleString()}
                    </p>
                  )}
                  {selectedStudent.verificationTxHash && (
                    <a
                      href={getExplorerUrl(selectedStudent.verificationTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      View verification transaction
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Select a student to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

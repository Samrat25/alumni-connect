import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { storage } from '@/lib/storage';
import { blockchain } from '@/lib/blockchain';
import { Student } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { toast } from 'sonner';
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
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function VerifierDashboard() {
  const { address, setRole } = useWallet();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
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
    try {
      // Record verification on blockchain
      await blockchain.verifyResume(address, selectedStudent.walletAddress, approved);

      // Update local storage
      const updatedStudent: Student = {
        ...selectedStudent,
        resumeStatus: approved ? 'verified' : 'rejected',
        verifiedAt: new Date().toISOString(),
        verifiedBy: address,
      };

      storage.saveStudent(updatedStudent);
      loadStudents();
      setSelectedStudent(null);
      
      toast.success(
        approved
          ? 'Resume verified successfully!'
          : 'Resume rejected successfully!'
      );
    } catch (error) {
      console.error('Error verifying resume:', error);
      toast.error('Failed to process verification');
    } finally {
      setIsProcessing(false);
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
            Review and verify student resumes on-chain
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
              <div className="p-4 rounded-xl bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Resume File</p>
                <p className="font-medium text-foreground text-sm mb-3">
                  {selectedStudent.resumeFileName}
                </p>
                <div className="flex items-start gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">On-chain Hash</p>
                    <code className="text-xs font-mono text-foreground break-all">
                      {selectedStudent.resumeHash}
                    </code>
                  </div>
                </div>
              </div>

              {/* Actions */}
              {selectedStudent.resumeStatus === 'unverified' && (
                <div className="flex gap-3">
                  <Button
                    variant="success"
                    className="flex-1"
                    onClick={() => handleVerify(true)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Verify Resume
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => handleVerify(false)}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reject
                  </Button>
                </div>
              )}

              {selectedStudent.resumeStatus !== 'unverified' && (
                <div className="p-4 rounded-xl bg-muted/50 text-center">
                  <p className="text-sm text-muted-foreground">
                    This resume has already been{' '}
                    <span className={cn(
                      'font-medium',
                      selectedStudent.resumeStatus === 'verified' ? 'text-success' : 'text-destructive'
                    )}>
                      {selectedStudent.resumeStatus}
                    </span>
                  </p>
                  {selectedStudent.verifiedAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      on {new Date(selectedStudent.verifiedAt).toLocaleString()}
                    </p>
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

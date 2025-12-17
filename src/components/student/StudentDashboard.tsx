import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { storage } from '@/lib/storage';
import { aptosTransactions, getExplorerUrl } from '@/lib/aptos';
import { Student, Job } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showTransactionToast, dismissToast } from '@/components/TransactionToast';
import { toast } from 'sonner';
import {
  FileText,
  Upload,
  Briefcase,
  CheckCircle,
  Loader2,
  Building2,
  MapPin,
  Calendar,
  ArrowLeft,
  ExternalLink,
  Hash,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function StudentDashboard() {
  const { address, setRole, signAndSubmitTransaction } = useWallet();
  const [student, setStudent] = useState<Student | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeTab, setActiveTab] = useState<'profile' | 'jobs'>('profile');
  const [isUploading, setIsUploading] = useState(false);
  const [isApplying, setIsApplying] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    college: '',
    department: '',
    graduationYear: new Date().getFullYear() + 1,
  });
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (address) {
      const existingStudent = storage.getStudent(address);
      if (existingStudent) {
        setStudent(existingStudent);
        setFormData({
          name: existingStudent.name,
          email: existingStudent.email,
          college: existingStudent.college,
          department: existingStudent.department,
          graduationYear: existingStudent.graduationYear,
        });
      }
      setJobs(storage.getJobs());
    }
  }, [address]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
    } else {
      toast.error('Please upload a PDF file');
    }
  };

  const handleSubmitResume = async () => {
    if (!address || !resumeFile) return;

    setIsUploading(true);
    const toastId = showTransactionToast({
      type: 'pending',
      message: 'Waiting for wallet signature...'
    });

    try {
      // Generate hash from file
      const hash = await storage.generateHash(resumeFile);

      // Sign transaction with Petra wallet - this will trigger Petra's popup
      const tx = await aptosTransactions.submitResume(
        hash,
        formData.name,
        signAndSubmitTransaction,
        address
      );

      dismissToast(toastId);
      showTransactionToast({
        type: 'success',
        message: 'Resume submitted on-chain!',
        txHash: tx.hash
      });

      // Save student data
      const newStudent: Student = {
        walletAddress: address,
        ...formData,
        resumeFileName: resumeFile.name,
        resumeHash: hash,
        resumeStatus: 'unverified',
        submittedAt: new Date().toISOString(),
        appliedJobs: student?.appliedJobs || [],
        txHash: tx.hash,
      };

      storage.saveStudent(newStudent);
      setStudent(newStudent);
    } catch (error: any) {
      dismissToast(toastId);
      showTransactionToast({
        type: 'error',
        message: error.message || 'Transaction failed'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleApplyJob = async (jobId: string) => {
    if (!address || !student) return;
    if (student.resumeStatus !== 'verified') {
      toast.error('Your resume must be verified before applying');
      return;
    }

    setIsApplying(jobId);
    const toastId = showTransactionToast({
      type: 'pending',
      message: 'Waiting for wallet signature...'
    });

    try {
      // Sign transaction with Petra wallet - this will trigger Petra's popup
      const tx = await aptosTransactions.applyToJob(
        jobId,
        student.resumeHash || '',
        signAndSubmitTransaction,
        address
      );

      dismissToast(toastId);
      showTransactionToast({
        type: 'success',
        message: 'Application submitted on-chain!',
        txHash: tx.hash
      });

      // Update local storage
      const job = storage.getJob(jobId);
      if (job) {
        job.applications.push(address);
        storage.saveJob(job);
      }

      const updatedStudent = {
        ...student,
        appliedJobs: [...student.appliedJobs, jobId],
      };
      storage.saveStudent(updatedStudent);
      setStudent(updatedStudent);

      storage.saveApplication({
        jobId,
        studentAddress: address,
        appliedAt: new Date().toISOString(),
        status: 'pending',
        txHash: tx.hash,
      });

      setJobs(storage.getJobs());
    } catch (error: any) {
      dismissToast(toastId);
      showTransactionToast({
        type: 'error',
        message: error.message || 'Transaction failed'
      });
    } finally {
      setIsApplying(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setRole(null)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Student Dashboard</h1>
            <p className="text-muted-foreground">
              Upload your resume and apply for referrals
            </p>
          </div>
        </div>
        {student && <StatusBadge status={student.resumeStatus} />}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('profile')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === 'profile'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <FileText className="w-4 h-4 inline-block mr-2" />
          My Profile
        </button>
        <button
          onClick={() => setActiveTab('jobs')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === 'jobs'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Briefcase className="w-4 h-4 inline-block mr-2" />
          Browse Jobs
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          {/* Profile Form */}
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Profile Information
            </h3>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    disabled={!!student?.resumeHash}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@college.edu"
                    disabled={!!student?.resumeHash}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="college">College</Label>
                <Input
                  id="college"
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  placeholder="State University"
                  disabled={!!student?.resumeHash}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="Computer Science"
                    disabled={!!student?.resumeHash}
                  />
                </div>
                <div>
                  <Label htmlFor="year">Graduation Year</Label>
                  <Input
                    id="year"
                    type="number"
                    value={formData.graduationYear}
                    onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) })}
                    disabled={!!student?.resumeHash}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Resume Upload */}
          <div className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Resume Upload
            </h3>

            {student?.resumeHash ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-success/10 border border-success/20">
                  <div className="flex items-center gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    <span className="font-medium text-foreground">
                      Resume Submitted On-Chain
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {student.resumeFileName}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      Resume Hash (SHA-256)
                    </p>
                    <code className="text-xs font-mono text-foreground break-all">
                      {student.resumeHash.slice(0, 32)}...
                    </code>
                  </div>
                  
                  {student.txHash && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Transaction</p>
                      <a
                        href={getExplorerUrl(student.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        {student.txHash.slice(0, 20)}...
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>Status: <StatusBadge status={student.resumeStatus} className="ml-2" /></p>
                  {student.verifiedAt && (
                    <p className="mt-2">
                      Verified on: {new Date(student.verifiedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center transition-colors',
                    resumeFile
                      ? 'border-success bg-success/5'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer block"
                  >
                    {resumeFile ? (
                      <>
                        <CheckCircle className="w-10 h-10 text-success mx-auto mb-3" />
                        <p className="font-medium text-foreground">{resumeFile.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Click to change file
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="font-medium text-foreground">
                          Click to upload your resume
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          PDF format only
                        </p>
                      </>
                    )}
                  </label>
                </div>

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Signing with Petra:</strong> Your resume hash will be recorded on Aptos Devnet. You'll need to approve the transaction in your wallet.
                  </p>
                </div>

                <Button
                  variant="student"
                  className="w-full"
                  onClick={handleSubmitResume}
                  disabled={!resumeFile || !formData.name || !formData.email || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Awaiting Signature...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Sign & Submit Resume
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {jobs.length === 0 ? (
            <div className="bg-card rounded-2xl p-12 border border-border/50 text-center">
              <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Jobs Posted Yet
              </h3>
              <p className="text-muted-foreground">
                Check back later for new opportunities
              </p>
            </div>
          ) : (
            jobs.map((job) => {
              const hasApplied = student?.appliedJobs.includes(job.id);
              const canApply = student?.resumeStatus === 'verified';

              return (
                <div
                  key={job.id}
                  className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-1">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-4 h-4" />
                          {job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(job.postedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                      <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {job.type}
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      {hasApplied ? (
                        <Button variant="success" disabled>
                          <CheckCircle className="w-4 h-4" />
                          Applied
                        </Button>
                      ) : (
                        <Button
                          variant="student"
                          onClick={() => handleApplyJob(job.id)}
                          disabled={!canApply || isApplying === job.id}
                        >
                          {isApplying === job.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Signing...
                            </>
                          ) : (
                            'Sign & Apply'
                          )}
                        </Button>
                      )}
                      {!canApply && !hasApplied && (
                        <p className="text-xs text-warning mt-2 text-center">
                          Resume must be verified
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </motion.div>
      )}
    </div>
  );
}

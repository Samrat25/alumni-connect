import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@/contexts/WalletContext';
import { storage } from '@/lib/storage';
import { aptosTransactions, getExplorerUrl } from '@/lib/aptos';
import { Student, Job, Application } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { showTransactionToast, dismissToast } from '@/components/TransactionToast';
import {
  Briefcase,
  Plus,
  Users,
  ArrowLeft,
  Building2,
  MapPin,
  FileText,
  Star,
  Send,
  Loader2,
  X,
  User,
  Mail,
  GraduationCap,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function AlumniDashboard() {
  const { address, setRole } = useWallet();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [verifiedStudents, setVerifiedStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates'>('jobs');
  const [showCreateJob, setShowCreateJob] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [processingAction, setProcessingAction] = useState<{ jobId: string; studentAddress: string; action: string } | null>(null);

  // Job form state
  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    location: '',
    type: 'full-time' as Job['type'],
    description: '',
    requirements: '',
  });

  useEffect(() => {
    loadData();
  }, [address]);

  const loadData = () => {
    if (address) {
      const allJobs = storage.getJobs().filter((j) => j.postedBy === address);
      setJobs(allJobs);
    }
    const students = Object.values(storage.getStudents()).filter(
      (s) => s.resumeStatus === 'verified'
    );
    setVerifiedStudents(students);
  };

  const handleCreateJob = async () => {
    if (!address) return;

    setIsCreating(true);
    const toastId = showTransactionToast({
      type: 'pending',
      message: 'Waiting for wallet signature to create job...'
    });

    try {
      const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

      // Sign transaction with Petra wallet
      const tx = await aptosTransactions.createJob(jobId, jobForm.title, jobForm.company);

      dismissToast(toastId);
      showTransactionToast({
        type: 'success',
        message: 'Job posted on-chain!',
        txHash: tx.hash
      });

      const newJob: Job = {
        id: jobId,
        title: jobForm.title,
        company: jobForm.company,
        location: jobForm.location,
        type: jobForm.type,
        description: jobForm.description,
        requirements: jobForm.requirements.split('\n').filter((r) => r.trim()),
        postedBy: address,
        postedByName: 'Alumni',
        postedAt: new Date().toISOString(),
        applications: [],
        shortlisted: [],
        referred: [],
        txHash: tx.hash,
      };

      storage.saveJob(newJob);
      loadData();
      setShowCreateJob(false);
      setJobForm({
        title: '',
        company: '',
        location: '',
        type: 'full-time',
        description: '',
        requirements: '',
      });
    } catch (error: any) {
      dismissToast(toastId);
      showTransactionToast({
        type: 'error',
        message: error.message || 'Transaction failed'
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleShortlist = async (jobId: string, studentAddress: string) => {
    setProcessingAction({ jobId, studentAddress, action: 'shortlist' });
    
    const toastId = showTransactionToast({
      type: 'pending',
      message: 'Waiting for wallet signature to shortlist candidate...'
    });

    try {
      const tx = await aptosTransactions.shortlistCandidate(jobId, studentAddress);

      dismissToast(toastId);
      showTransactionToast({
        type: 'success',
        message: 'Candidate shortlisted on-chain!',
        txHash: tx.hash
      });

      const job = storage.getJob(jobId);
      if (job) {
        if (!job.shortlisted.includes(studentAddress)) {
          job.shortlisted.push(studentAddress);
          storage.saveJob(job);

          const application = storage.getApplications().find(
            (a) => a.jobId === jobId && a.studentAddress === studentAddress
          );
          if (application) {
            application.status = 'shortlisted';
            storage.saveApplication(application);
          }
          loadData();
          setSelectedJob(storage.getJob(jobId));
        }
      }
    } catch (error: any) {
      dismissToast(toastId);
      showTransactionToast({
        type: 'error',
        message: error.message || 'Transaction failed'
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const handleRefer = async (jobId: string, studentAddress: string) => {
    setProcessingAction({ jobId, studentAddress, action: 'refer' });
    
    const toastId = showTransactionToast({
      type: 'pending',
      message: 'Waiting for wallet signature to provide referral...'
    });

    try {
      const tx = await aptosTransactions.referCandidate(jobId, studentAddress);

      dismissToast(toastId);
      showTransactionToast({
        type: 'success',
        message: 'Referral provided on-chain!',
        txHash: tx.hash
      });

      const job = storage.getJob(jobId);
      if (job) {
        if (!job.referred.includes(studentAddress)) {
          job.referred.push(studentAddress);
          storage.saveJob(job);

          const application = storage.getApplications().find(
            (a) => a.jobId === jobId && a.studentAddress === studentAddress
          );
          if (application) {
            application.status = 'referred';
            storage.saveApplication(application);
          }
          loadData();
          setSelectedJob(storage.getJob(jobId));
        }
      }
    } catch (error: any) {
      dismissToast(toastId);
      showTransactionToast({
        type: 'error',
        message: error.message || 'Transaction failed'
      });
    } finally {
      setProcessingAction(null);
    }
  };

  const getJobApplications = (jobId: string): (Application & { student: Student })[] => {
    const applications = storage.getJobApplications(jobId);
    return applications
      .map((app) => {
        const student = storage.getStudent(app.studentAddress);
        return student ? { ...app, student } : null;
      })
      .filter(Boolean) as (Application & { student: Student })[];
  };

  const isProcessingThis = (jobId: string, studentAddress: string, action: string) => {
    return processingAction?.jobId === jobId && 
           processingAction?.studentAddress === studentAddress && 
           processingAction?.action === action;
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
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-alumni" />
              Alumni Dashboard
            </h1>
            <p className="text-muted-foreground">
              Create jobs and provide signed referrals to verified students
            </p>
          </div>
        </div>
        <Button variant="alumni" onClick={() => setShowCreateJob(true)}>
          <Plus className="w-4 h-4" />
          Post Job
        </Button>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <p className="text-2xl font-bold text-foreground">{jobs.length}</p>
          <p className="text-sm text-muted-foreground">Jobs Posted</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <p className="text-2xl font-bold text-foreground">
            {jobs.reduce((acc, job) => acc + job.applications.length, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Total Applications</p>
        </div>
        <div className="bg-card rounded-xl p-4 border border-border/50">
          <p className="text-2xl font-bold text-foreground">
            {jobs.reduce((acc, job) => acc + job.referred.length, 0)}
          </p>
          <p className="text-sm text-muted-foreground">Referrals Given</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit">
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
          My Jobs
        </button>
        <button
          onClick={() => setActiveTab('candidates')}
          className={cn(
            'px-4 py-2 rounded-md text-sm font-medium transition-all',
            activeTab === 'candidates'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Users className="w-4 h-4 inline-block mr-2" />
          Verified Candidates
        </button>
      </div>

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Job List */}
          <div className="space-y-4">
            {jobs.length === 0 ? (
              <div className="bg-card rounded-2xl p-12 border border-border/50 text-center">
                <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Jobs Posted Yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Create your first job posting to start receiving applications
                </p>
                <Button variant="alumni" onClick={() => setShowCreateJob(true)}>
                  <Plus className="w-4 h-4" />
                  Post Job
                </Button>
              </div>
            ) : (
              jobs.map((job) => (
                <motion.button
                  key={job.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => setSelectedJob(job)}
                  className={cn(
                    'w-full bg-card rounded-xl p-4 border-2 text-left transition-all',
                    selectedJob?.id === job.id
                      ? 'border-alumni shadow-md'
                      : 'border-border/50 hover:border-alumni/50'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground">{job.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {job.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {job.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-muted-foreground">
                        {job.applications.length} applications
                      </span>
                      <span className="text-success">
                        {job.referred.length} referred
                      </span>
                    </div>
                    {job.txHash && (
                      <a
                        href={getExplorerUrl(job.txHash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </motion.button>
              ))
            )}
          </div>

          {/* Job Details / Applications */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            {selectedJob ? (
              <div>
                <div className="p-4 border-b border-border/50">
                  <h3 className="font-semibold text-foreground">
                    Applications for {selectedJob.title}
                  </h3>
                </div>
                <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
                  {getJobApplications(selectedJob.id).length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No applications yet
                    </div>
                  ) : (
                    getJobApplications(selectedJob.id).map(({ student, status, txHash }) => (
                      <div
                        key={student.walletAddress}
                        className="p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-foreground">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.college} • {student.department}
                            </p>
                          </div>
                          <StatusBadge status={status} />
                        </div>
                        {txHash && (
                          <a
                            href={getExplorerUrl(txHash)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mb-3"
                          >
                            Application TX
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        <div className="flex gap-2">
                          {status === 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleShortlist(selectedJob.id, student.walletAddress)}
                              disabled={!!processingAction}
                            >
                              {isProcessingThis(selectedJob.id, student.walletAddress, 'shortlist') ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Star className="w-3.5 h-3.5" />
                              )}
                              Sign & Shortlist
                            </Button>
                          )}
                          {(status === 'pending' || status === 'shortlisted') && (
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleRefer(selectedJob.id, student.walletAddress)}
                              disabled={!!processingAction}
                            >
                              {isProcessingThis(selectedJob.id, student.walletAddress, 'refer') ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Send className="w-3.5 h-3.5" />
                              )}
                              Sign & Refer
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a job to view applications
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Candidates Tab */}
      {activeTab === 'candidates' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Candidate List */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <Users className="w-4 h-4" />
                Verified Students ({verifiedStudents.length})
              </h3>
            </div>
            <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
              {verifiedStudents.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No verified students yet
                </div>
              ) : (
                verifiedStudents.map((student) => (
                  <button
                    key={student.walletAddress}
                    onClick={() => setSelectedStudent(student)}
                    className={cn(
                      'w-full p-4 text-left hover:bg-muted/50 transition-colors',
                      selectedStudent?.walletAddress === student.walletAddress &&
                        'bg-alumni/5'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.college} • Class of {student.graduationYear}
                        </p>
                      </div>
                      <CheckCircle className="w-4 h-4 text-success" />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Candidate Details */}
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            {selectedStudent ? (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-alumni/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-alumni" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedStudent.name}
                    </h3>
                    <p className="text-muted-foreground">{selectedStudent.department}</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedStudent.email}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{selectedStudent.college}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <GraduationCap className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">Class of {selectedStudent.graduationYear}</span>
                  </div>
                </div>

                <div className="pt-4 space-y-2">
                  <p className="text-xs text-muted-foreground">Resume Verified On-Chain</p>
                  <code className="text-xs font-mono text-foreground bg-muted/50 p-2 rounded block break-all">
                    {selectedStudent.resumeHash?.slice(0, 40)}...
                  </code>
                  {selectedStudent.verificationTxHash && (
                    <a
                      href={getExplorerUrl(selectedStudent.verificationTxHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      View verification TX
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center">
                <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Select a candidate to view profile
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      <AnimatePresence>
        {showCreateJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowCreateJob(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-card rounded-2xl p-6 w-full max-w-lg shadow-xl border border-border/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">Post New Job</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCreateJob(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Job Title</Label>
                  <Input
                    id="title"
                    value={jobForm.title}
                    onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                    placeholder="Software Engineer"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={jobForm.company}
                      onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                      placeholder="Tech Corp"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="type">Job Type</Label>
                  <select
                    id="type"
                    value={jobForm.type}
                    onChange={(e) => setJobForm({ ...jobForm, type: e.target.value as Job['type'] })}
                    className="w-full h-10 px-3 rounded-lg border border-input bg-background text-foreground"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="internship">Internship</option>
                    <option value="contract">Contract</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={jobForm.description}
                    onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                    placeholder="Describe the role and responsibilities..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="requirements">Requirements (one per line)</Label>
                  <Textarea
                    id="requirements"
                    value={jobForm.requirements}
                    onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                    placeholder="3+ years experience&#10;Bachelor's degree&#10;Strong communication"
                    rows={3}
                  />
                </div>

                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs text-muted-foreground">
                    <strong className="text-foreground">Signed Job Posting:</strong> Your job will be recorded on Aptos Devnet with your wallet signature.
                  </p>
                </div>

                <Button
                  variant="alumni"
                  className="w-full"
                  onClick={handleCreateJob}
                  disabled={!jobForm.title || !jobForm.company || isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Awaiting Signature...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Sign & Create Job
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

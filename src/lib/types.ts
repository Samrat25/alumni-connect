export type UserRole = 'student' | 'verifier' | 'alumni' | null;

export type ResumeStatus = 'unverified' | 'verified' | 'rejected';

export interface Student {
  walletAddress: string;
  name: string;
  email: string;
  college: string;
  department: string;
  graduationYear: number;
  resumeFile?: File;
  resumeFileName?: string;
  resumeHash?: string;
  resumeStatus: ResumeStatus;
  submittedAt?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  appliedJobs: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  description: string;
  requirements: string[];
  postedBy: string;
  postedByName: string;
  postedAt: string;
  applications: string[]; // wallet addresses
  shortlisted: string[];
  referred: string[];
}

export interface Application {
  jobId: string;
  studentAddress: string;
  appliedAt: string;
  status: 'pending' | 'shortlisted' | 'referred' | 'rejected';
}

export interface BlockchainTransaction {
  hash: string;
  type: 'submit_resume' | 'verify_resume' | 'create_job' | 'apply_job';
  timestamp: string;
  status: 'pending' | 'success' | 'failed';
}

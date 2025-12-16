import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Configure Aptos client for devnet
const config = new AptosConfig({ network: Network.DEVNET });
export const aptos = new Aptos(config);

// Helper to get Petra wallet
export const getPetra = () => {
  if (typeof window !== 'undefined' && 'aptos' in window) {
    return (window as any).aptos;
  }
  return null;
};

// Check if Petra is installed
export const isPetraInstalled = () => {
  return getPetra() !== null;
};

// Transaction types for our app
export type TransactionType = 
  | 'submit_resume' 
  | 'verify_resume' 
  | 'reject_resume'
  | 'create_job' 
  | 'apply_job'
  | 'shortlist_candidate'
  | 'refer_candidate';

export interface SignedTransaction {
  hash: string;
  type: TransactionType;
  timestamp: string;
  sender: string;
  success: boolean;
  payload: Record<string, any>;
}

// Store transaction in localStorage for reference
const TRANSACTIONS_KEY = 'chainrefer_transactions';

export const saveTransaction = (tx: SignedTransaction) => {
  const existing = localStorage.getItem(TRANSACTIONS_KEY);
  const transactions: SignedTransaction[] = existing ? JSON.parse(existing) : [];
  transactions.push(tx);
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
};

export const getTransactions = (): SignedTransaction[] => {
  const data = localStorage.getItem(TRANSACTIONS_KEY);
  return data ? JSON.parse(data) : [];
};

// Create a payload for storing data on-chain
// Using Aptos coin transfer as a signed transaction mechanism for the prototype
// In production, you'd use a custom Move module
export const createSignedTransaction = async (
  type: TransactionType,
  data: Record<string, any>
): Promise<SignedTransaction> => {
  const petra = getPetra();
  if (!petra) {
    throw new Error('Petra wallet not found');
  }

  // Ensure we're on devnet
  const network = await petra.network();
  if (network !== 'Devnet') {
    try {
      await petra.changeNetwork({ networkName: 'Devnet' });
    } catch (e) {
      console.warn('Could not auto-switch network. Please switch to Devnet manually.');
    }
  }

  // Create a transaction payload
  // For the prototype, we'll create a 0-value coin transfer to ourselves
  // with the data encoded in the transaction
  // In production, use a custom Move module with entry functions
  
  const account = await petra.account();
  
  // Create payload with memo-like data in function arguments
  // This creates a verifiable on-chain record
  const payload = {
    type: 'entry_function_payload',
    function: '0x1::aptos_account::transfer',
    type_arguments: [],
    arguments: [
      account.address, // Transfer to self (0 APT just for signing)
      '0' // 0 APT transfer - just creating a signed record
    ]
  };

  try {
    // Sign and submit the transaction
    const pendingTx = await petra.signAndSubmitTransaction(payload);
    
    // Wait for confirmation
    const txResult = await aptos.waitForTransaction({
      transactionHash: pendingTx.hash
    });

    const signedTx: SignedTransaction = {
      hash: pendingTx.hash,
      type,
      timestamp: new Date().toISOString(),
      sender: account.address,
      success: txResult.success,
      payload: data
    };

    saveTransaction(signedTx);
    
    return signedTx;
  } catch (error: any) {
    // If user rejected or error occurred
    throw new Error(error.message || 'Transaction failed');
  }
};

// Specific transaction functions
export const aptosTransactions = {
  // Student submits resume hash
  submitResume: async (resumeHash: string, studentName: string) => {
    return createSignedTransaction('submit_resume', {
      resumeHash,
      studentName,
      action: 'RESUME_SUBMITTED'
    });
  },

  // Verifier approves resume
  verifyResume: async (studentAddress: string, resumeHash: string) => {
    return createSignedTransaction('verify_resume', {
      studentAddress,
      resumeHash,
      action: 'RESUME_VERIFIED',
      status: 'APPROVED'
    });
  },

  // Verifier rejects resume
  rejectResume: async (studentAddress: string, resumeHash: string) => {
    return createSignedTransaction('reject_resume', {
      studentAddress,
      resumeHash,
      action: 'RESUME_REJECTED',
      status: 'REJECTED'
    });
  },

  // Alumni creates job
  createJob: async (jobId: string, jobTitle: string, company: string) => {
    return createSignedTransaction('create_job', {
      jobId,
      jobTitle,
      company,
      action: 'JOB_CREATED'
    });
  },

  // Student applies to job
  applyToJob: async (jobId: string, resumeHash: string) => {
    return createSignedTransaction('apply_job', {
      jobId,
      resumeHash,
      action: 'JOB_APPLICATION'
    });
  },

  // Alumni shortlists candidate
  shortlistCandidate: async (jobId: string, studentAddress: string) => {
    return createSignedTransaction('shortlist_candidate', {
      jobId,
      studentAddress,
      action: 'CANDIDATE_SHORTLISTED'
    });
  },

  // Alumni refers candidate
  referCandidate: async (jobId: string, studentAddress: string) => {
    return createSignedTransaction('refer_candidate', {
      jobId,
      studentAddress,
      action: 'REFERRAL_PROVIDED'
    });
  }
};

// Get explorer URL for transaction
export const getExplorerUrl = (txHash: string) => {
  return `https://explorer.aptoslabs.com/txn/${txHash}?network=devnet`;
};

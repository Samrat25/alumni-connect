import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Configure Aptos client for devnet
const config = new AptosConfig({ network: Network.DEVNET });
export const aptos = new Aptos(config);

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

// Create a real signed transaction with Petra wallet
// This will trigger Petra's popup and submit to Aptos Devnet
export const createSignedTransaction = async (
  type: TransactionType,
  data: Record<string, any>,
  signAndSubmitTransaction: (transaction: any) => Promise<any>,
  senderAddress: string
): Promise<SignedTransaction> => {
  try {
    console.log('Creating transaction for:', type, 'from:', senderAddress);

    // Simple transaction payload that Petra can handle
    const payload = {
      function: "0x1::coin::transfer",
      type_arguments: ["0x1::aptos_coin::AptosCoin"],
      arguments: [senderAddress, "1"], // Transfer 1 octa to self
    };

    console.log('Transaction payload:', payload);

    // Sign and submit - this triggers Petra's popup
    const pendingTxn = await signAndSubmitTransaction(payload);
    
    console.log('Pending transaction:', pendingTxn);

    // Extract hash from response
    const txHash = pendingTxn.hash || pendingTxn;

    // Wait for the transaction to be confirmed
    const executedTransaction = await aptos.waitForTransaction({
      transactionHash: txHash,
    });

    console.log('Executed transaction:', executedTransaction);

    const signedTx: SignedTransaction = {
      hash: txHash,
      type,
      timestamp: new Date().toISOString(),
      sender: senderAddress,
      success: executedTransaction.success,
      payload: data
    };

    saveTransaction(signedTx);
    
    return signedTx;
  } catch (error: any) {
    console.error('Transaction error:', error);
    throw new Error(error.message || 'Transaction failed');
  }
};

// Specific transaction functions
// These need to be called with the signAndSubmitTransaction function from wallet context
export const aptosTransactions = {
  // Student submits resume hash
  submitResume: async (
    resumeHash: string,
    studentName: string,
    signAndSubmitTransaction: (tx: any) => Promise<any>,
    senderAddress: string
  ) => {
    return createSignedTransaction(
      'submit_resume',
      {
        resumeHash,
        studentName,
        action: 'RESUME_SUBMITTED'
      },
      signAndSubmitTransaction,
      senderAddress
    );
  },

  // Verifier approves resume
  verifyResume: async (
    studentAddress: string,
    resumeHash: string,
    signAndSubmitTransaction: (tx: any) => Promise<any>,
    senderAddress: string
  ) => {
    return createSignedTransaction(
      'verify_resume',
      {
        studentAddress,
        resumeHash,
        action: 'RESUME_VERIFIED',
        status: 'APPROVED'
      },
      signAndSubmitTransaction,
      senderAddress
    );
  },

  // Verifier rejects resume
  rejectResume: async (
    studentAddress: string,
    resumeHash: string,
    signAndSubmitTransaction: (tx: any) => Promise<any>,
    senderAddress: string
  ) => {
    return createSignedTransaction(
      'reject_resume',
      {
        studentAddress,
        resumeHash,
        action: 'RESUME_REJECTED',
        status: 'REJECTED'
      },
      signAndSubmitTransaction,
      senderAddress
    );
  },

  // Alumni creates job
  createJob: async (
    jobId: string,
    jobTitle: string,
    company: string,
    signAndSubmitTransaction: (tx: any) => Promise<any>,
    senderAddress: string
  ) => {
    return createSignedTransaction(
      'create_job',
      {
        jobId,
        jobTitle,
        company,
        action: 'JOB_CREATED'
      },
      signAndSubmitTransaction,
      senderAddress
    );
  },

  // Student applies to job
  applyToJob: async (
    jobId: string,
    resumeHash: string,
    signAndSubmitTransaction: (tx: any) => Promise<any>,
    senderAddress: string
  ) => {
    return createSignedTransaction(
      'apply_job',
      {
        jobId,
        resumeHash,
        action: 'JOB_APPLICATION'
      },
      signAndSubmitTransaction,
      senderAddress
    );
  },

  // Alumni shortlists candidate
  shortlistCandidate: async (
    jobId: string,
    studentAddress: string,
    signAndSubmitTransaction: (tx: any) => Promise<any>,
    senderAddress: string
  ) => {
    return createSignedTransaction(
      'shortlist_candidate',
      {
        jobId,
        studentAddress,
        action: 'CANDIDATE_SHORTLISTED'
      },
      signAndSubmitTransaction,
      senderAddress
    );
  },

  // Alumni refers candidate
  referCandidate: async (
    jobId: string,
    studentAddress: string,
    signAndSubmitTransaction: (tx: any) => Promise<any>,
    senderAddress: string
  ) => {
    return createSignedTransaction(
      'refer_candidate',
      {
        jobId,
        studentAddress,
        action: 'REFERRAL_PROVIDED'
      },
      signAndSubmitTransaction,
      senderAddress
    );
  }
};

// Get explorer URL for transaction
export const getExplorerUrl = (txHash: string) => {
  return `https://explorer.aptoslabs.com/txn/${txHash}?network=devnet`;
};

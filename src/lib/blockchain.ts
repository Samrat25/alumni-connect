// Mock blockchain interactions for prototype
// In production, these would interact with actual Aptos smart contracts

import { BlockchainTransaction } from './types';

// Simulated delay for blockchain operations
const BLOCKCHAIN_DELAY = 1500;

export const blockchain = {
  // Submit resume hash to chain
  submitResumeHash: async (
    walletAddress: string,
    resumeHash: string
  ): Promise<BlockchainTransaction> => {
    await new Promise(resolve => setTimeout(resolve, BLOCKCHAIN_DELAY));
    
    const tx: BlockchainTransaction = {
      hash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`,
      type: 'submit_resume',
      timestamp: new Date().toISOString(),
      status: 'success',
    };
    
    console.log('📝 Resume hash submitted to blockchain:', {
      wallet: walletAddress,
      resumeHash,
      txHash: tx.hash,
    });
    
    return tx;
  },

  // Verify resume on chain
  verifyResume: async (
    verifierAddress: string,
    studentAddress: string,
    approved: boolean
  ): Promise<BlockchainTransaction> => {
    await new Promise(resolve => setTimeout(resolve, BLOCKCHAIN_DELAY));
    
    const tx: BlockchainTransaction = {
      hash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`,
      type: 'verify_resume',
      timestamp: new Date().toISOString(),
      status: 'success',
    };
    
    console.log('✅ Resume verification recorded on blockchain:', {
      verifier: verifierAddress,
      student: studentAddress,
      approved,
      txHash: tx.hash,
    });
    
    return tx;
  },

  // Create job on chain
  createJob: async (
    alumniAddress: string,
    jobId: string
  ): Promise<BlockchainTransaction> => {
    await new Promise(resolve => setTimeout(resolve, BLOCKCHAIN_DELAY));
    
    const tx: BlockchainTransaction = {
      hash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`,
      type: 'create_job',
      timestamp: new Date().toISOString(),
      status: 'success',
    };
    
    console.log('💼 Job created on blockchain:', {
      alumni: alumniAddress,
      jobId,
      txHash: tx.hash,
    });
    
    return tx;
  },

  // Apply to job on chain
  applyToJob: async (
    studentAddress: string,
    jobId: string
  ): Promise<BlockchainTransaction> => {
    await new Promise(resolve => setTimeout(resolve, BLOCKCHAIN_DELAY));
    
    const tx: BlockchainTransaction = {
      hash: `0x${Date.now().toString(16)}${Math.random().toString(16).slice(2, 10)}`,
      type: 'apply_job',
      timestamp: new Date().toISOString(),
      status: 'success',
    };
    
    console.log('📨 Job application recorded on blockchain:', {
      student: studentAddress,
      jobId,
      txHash: tx.hash,
    });
    
    return tx;
  },

  // Verify hash matches (mock comparison)
  verifyHash: (localHash: string, chainHash: string): boolean => {
    return localHash === chainHash;
  },
};

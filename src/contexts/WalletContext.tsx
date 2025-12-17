import React, { createContext, useContext, useState, useCallback } from 'react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { UserRole } from '@/lib/types';
import { storage } from '@/lib/storage';

interface WalletContextType {
  connected: boolean;
  address: string | null;
  role: UserRole;
  connecting: boolean;
  network: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setRole: (role: UserRole) => void;
  isVerifier: boolean;
  signAndSubmitTransaction: (transaction: any) => Promise<any>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const {
    connect: aptosConnect,
    disconnect: aptosDisconnect,
    account,
    connected: aptosConnected,
    signAndSubmitTransaction: aptosSignAndSubmit,
    wallets,
  } = useAptosWallet();

  const [role, setRoleState] = useState<UserRole>(null);
  const [network] = useState<string | null>('Devnet');
  const [isConnecting, setIsConnecting] = useState(false);

  // Get address directly from account
  const address = account?.address?.toString() || null;
  
  const connected = aptosConnected;
  const connecting = isConnecting;

  const verifierAddress = storage.getVerifierAddress();
  const isVerifier = address && verifierAddress 
    ? address.toLowerCase() === verifierAddress.toLowerCase() 
    : false;

  // Connect to wallet - this will trigger Petra's popup
  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const petraWallet = wallets.find(w => w.name === 'Petra');
      if (!petraWallet) {
        throw new Error('Petra Wallet not found. Please install Petra extension and refresh the page.');
      }
      
      await aptosConnect(petraWallet.name);
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      throw new Error(error.message || 'User rejected the connection request');
    } finally {
      setIsConnecting(false);
    }
  }, [aptosConnect, wallets]);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    try {
      await aptosDisconnect();
      setRoleState(null);
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }, [aptosDisconnect]);

  // Set user role
  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
  }, []);

  // Sign and submit transaction using wallet adapter
  const signAndSubmitTransaction = useCallback(
    async (payload: any) => {
      console.log('signAndSubmitTransaction called');
      
      if (!connected) {
        throw new Error('Wallet not connected');
      }
      
      if (!aptosSignAndSubmit) {
        throw new Error('Wallet not ready');
      }
      
      // Wrap payload in the format wallet adapter expects
      const txPayload = {
        data: {
          function: payload.function,
          typeArguments: payload.type_arguments || [],
          functionArguments: payload.arguments || [],
        }
      };
      
      console.log('Submitting with payload:', txPayload);
      
      const response = await aptosSignAndSubmit(txPayload);
      console.log('Transaction response:', response);
      return response;
    },
    [connected, aptosSignAndSubmit]
  );

  return (
    <WalletContext.Provider
      value={{
        connected,
        address,
        role,
        connecting,
        network,
        connect,
        disconnect,
        setRole,
        isVerifier,
        signAndSubmitTransaction,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}

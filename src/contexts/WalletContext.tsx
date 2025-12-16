import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserRole } from '@/lib/types';
import { storage } from '@/lib/storage';

interface WalletContextType {
  connected: boolean;
  address: string | null;
  role: UserRole;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  setRole: (role: UserRole) => void;
  isVerifier: boolean;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [role, setRoleState] = useState<UserRole>(null);
  const [connecting, setConnecting] = useState(false);

  const verifierAddress = storage.getVerifierAddress();
  const isVerifier = address?.toLowerCase() === verifierAddress.toLowerCase();

  // Check if Petra wallet is installed
  const isPetraInstalled = () => {
    return typeof window !== 'undefined' && 'petra' in window;
  };

  // Connect to Petra wallet
  const connect = useCallback(async () => {
    if (!isPetraInstalled()) {
      window.open('https://petra.app/', '_blank');
      return;
    }

    setConnecting(true);
    try {
      const petra = (window as any).petra;
      const response = await petra.connect();
      
      if (response.address) {
        setAddress(response.address);
        setConnected(true);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(() => {
    if (isPetraInstalled()) {
      (window as any).petra?.disconnect();
    }
    setConnected(false);
    setAddress(null);
    setRoleState(null);
  }, []);

  // Set user role
  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
  }, []);

  // Check connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (isPetraInstalled()) {
        try {
          const petra = (window as any).petra;
          const isConnected = await petra.isConnected();
          if (isConnected) {
            const account = await petra.account();
            if (account?.address) {
              setAddress(account.address);
              setConnected(true);
            }
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };
    checkConnection();
  }, []);

  return (
    <WalletContext.Provider
      value={{
        connected,
        address,
        role,
        connecting,
        connect,
        disconnect,
        setRole,
        isVerifier,
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

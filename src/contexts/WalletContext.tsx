import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { UserRole } from '@/lib/types';
import { storage } from '@/lib/storage';
import { getPetra, isPetraInstalled } from '@/lib/aptos';

interface WalletContextType {
  connected: boolean;
  address: string | null;
  role: UserRole;
  connecting: boolean;
  network: string | null;
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
  const [network, setNetwork] = useState<string | null>(null);

  const verifierAddress = storage.getVerifierAddress();
  const isVerifier = address?.toLowerCase() === verifierAddress.toLowerCase();

  // Connect to Petra wallet
  const connect = useCallback(async () => {
    if (!isPetraInstalled()) {
      window.open('https://petra.app/', '_blank');
      return;
    }

    setConnecting(true);
    try {
      const petra = getPetra();
      
      // Connect to wallet
      const response = await petra.connect();
      
      if (response.address) {
        setAddress(response.address);
        setConnected(true);
        
        // Check and switch to devnet
        const currentNetwork = await petra.network();
        setNetwork(currentNetwork);
        
        if (currentNetwork !== 'Devnet') {
          try {
            await petra.changeNetwork({ networkName: 'Devnet' });
            setNetwork('Devnet');
          } catch (e) {
            console.warn('Please switch to Devnet manually in Petra');
          }
        }
      }
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setConnecting(false);
    }
  }, []);

  // Disconnect wallet
  const disconnect = useCallback(async () => {
    const petra = getPetra();
    if (petra) {
      try {
        await petra.disconnect();
      } catch (e) {
        console.error('Error disconnecting:', e);
      }
    }
    setConnected(false);
    setAddress(null);
    setRoleState(null);
    setNetwork(null);
  }, []);

  // Set user role
  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
  }, []);

  // Check connection and listen for account changes
  useEffect(() => {
    const checkConnection = async () => {
      if (isPetraInstalled()) {
        try {
          const petra = getPetra();
          const isConnected = await petra.isConnected();
          
          if (isConnected) {
            const account = await petra.account();
            if (account?.address) {
              setAddress(account.address);
              setConnected(true);
              
              const currentNetwork = await petra.network();
              setNetwork(currentNetwork);
            }
          }
        } catch (error) {
          console.error('Error checking wallet connection:', error);
        }
      }
    };

    checkConnection();

    // Listen for account changes
    if (isPetraInstalled()) {
      const petra = getPetra();
      
      const handleAccountChange = async () => {
        try {
          const account = await petra.account();
          if (account?.address) {
            setAddress(account.address);
          } else {
            setConnected(false);
            setAddress(null);
            setRoleState(null);
          }
        } catch (e) {
          setConnected(false);
          setAddress(null);
        }
      };

      const handleNetworkChange = async (network: string) => {
        setNetwork(network);
      };

      const handleDisconnect = () => {
        setConnected(false);
        setAddress(null);
        setRoleState(null);
        setNetwork(null);
      };

      petra.onAccountChange(handleAccountChange);
      petra.onNetworkChange(handleNetworkChange);
      petra.onDisconnect(handleDisconnect);
    }
  }, []);

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

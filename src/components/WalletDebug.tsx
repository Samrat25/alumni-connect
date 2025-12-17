import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { useEffect } from 'react';

export function WalletDebug() {
  const { wallets, connected, account } = useAptosWallet();

  useEffect(() => {
    console.log('=== WALLET DEBUG ===');
    console.log('Available wallets:', wallets.map(w => ({ name: w.name, readyState: w.readyState })));
    console.log('Connected:', connected);
    console.log('Account object:', account);
    console.log('Account.address:', account?.address);
    console.log('Account.address type:', typeof account?.address);
    console.log('Window.aptos:', typeof window !== 'undefined' ? (window as any).aptos : 'undefined');
    console.log('===================');
  }, [wallets, connected, account]);

  return (
    <div className="fixed bottom-4 left-4 bg-card border border-border rounded-lg p-4 text-xs max-w-sm z-50">
      <h3 className="font-bold mb-2">Wallet Debug Info</h3>
      <div className="space-y-1 text-xs">
        <p>Available Wallets: {wallets.length}</p>
        {wallets.map(w => (
          <p key={w.name}>- {w.name}: {w.readyState}</p>
        ))}
        <p>Connected: {connected ? 'Yes' : 'No'}</p>
        <p>Account: {account ? 'Present' : 'None'}</p>
        <p className="break-all">Address: {account?.address ? String(account.address) : 'None'}</p>
        <p>Petra Ext: {typeof window !== 'undefined' && (window as any).aptos ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
}

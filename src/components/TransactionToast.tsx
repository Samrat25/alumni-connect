import { toast } from 'sonner';
import { ExternalLink, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { getExplorerUrl } from '@/lib/aptos';

interface TransactionToastProps {
  type: 'pending' | 'success' | 'error';
  message: string;
  txHash?: string;
}

export function showTransactionToast({ type, message, txHash }: TransactionToastProps) {
  const toastContent = (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        {type === 'pending' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        {type === 'success' && <CheckCircle className="w-4 h-4 text-success" />}
        {type === 'error' && <XCircle className="w-4 h-4 text-destructive" />}
        <span className="font-medium">{message}</span>
      </div>
      {txHash && (
        <a
          href={getExplorerUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          View on Explorer
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );

  if (type === 'pending') {
    return toast.loading(toastContent, { duration: Infinity });
  } else if (type === 'success') {
    return toast.success(toastContent, { duration: 5000 });
  } else {
    return toast.error(toastContent, { duration: 5000 });
  }
}

export function dismissToast(toastId: string | number) {
  toast.dismiss(toastId);
}

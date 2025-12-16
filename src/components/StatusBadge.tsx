import { cn } from '@/lib/utils';
import { ResumeStatus } from '@/lib/types';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface StatusBadgeProps {
  status: ResumeStatus | 'pending' | 'shortlisted' | 'referred' | 'rejected';
  className?: string;
}

const statusConfig = {
  unverified: {
    label: 'Unverified',
    icon: Clock,
    className: 'bg-warning/10 text-warning border-warning/20',
  },
  verified: {
    label: 'Verified',
    icon: CheckCircle,
    className: 'bg-success/10 text-success border-success/20',
  },
  rejected: {
    label: 'Rejected',
    icon: XCircle,
    className: 'bg-destructive/10 text-destructive border-destructive/20',
  },
  pending: {
    label: 'Pending',
    icon: Clock,
    className: 'bg-info/10 text-info border-info/20',
  },
  shortlisted: {
    label: 'Shortlisted',
    icon: CheckCircle,
    className: 'bg-primary/10 text-primary border-primary/20',
  },
  referred: {
    label: 'Referred',
    icon: CheckCircle,
    className: 'bg-success/10 text-success border-success/20',
  },
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
        config.className,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {config.label}
    </span>
  );
}

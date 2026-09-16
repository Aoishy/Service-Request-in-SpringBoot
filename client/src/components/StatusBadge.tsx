
import React from 'react';
import { cn } from '../utils/cn';
import type { RequestStatus } from '../types';
import { Clock, Loader2, CheckCircle2, XCircle, Ban } from 'lucide-react';

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  showIcon = true,
}) => {
  const normalizedStatus = String(status).toLowerCase() as RequestStatus;

  const config =
    {
      pending: {
        label: 'Pending',
        bg: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
        icon: Clock,
      },
      processing: {
        label: 'Processing',
        bg: 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300 shadow-indigo-500/10 shadow-sm animate-pulse-soft',
        icon: Loader2,
        spin: true,
      },
      completed: {
        label: 'Completed',
        bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
        icon: CheckCircle2,
      },
      failed: {
        label: 'Failed',
        bg: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
        icon: XCircle,
      },
      cancelled: {
        label: 'Cancelled',
        bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
        icon: Ban,
      },
    }[normalizedStatus] ??
    {
      label: String(status),
      bg: 'bg-slate-500/10 border-slate-500/20 text-slate-400',
      icon: Clock,
    };

  const Icon = config.icon;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border tracking-wide uppercase',
        config.bg,
        className
      )}
    >
      {showIcon && (
        <Icon
          className={cn(
            'w-3.5 h-3.5',
            config.spin && 'animate-spin'
          )}
        />
      )}

      {config.label}
    </span>
  );
};


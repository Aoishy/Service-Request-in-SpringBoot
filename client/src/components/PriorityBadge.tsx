
import React from 'react';
import { cn } from '../utils/cn';
import type { RequestPriority } from '../types';

interface PriorityBadgeProps {
  priority: RequestPriority;
  className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  className,
}) => {
  const normalizedPriority = String(priority).toLowerCase() as RequestPriority;

  const config =
    {
      low: {
        label: 'Low',
        style: 'bg-slate-700/40 text-slate-300 border-slate-600/30',
      },
      medium: {
        label: 'Medium',
        style: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      },
      high: {
        label: 'High',
        style: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      },
      critical: {
        label: 'Critical',
        style:
          'bg-rose-500/15 text-rose-400 border-rose-500/30 font-semibold shadow-rose-950/20',
      },
    }[normalizedPriority] ??
    {
      label: String(priority),
      style: 'bg-slate-700/40 text-slate-300 border-slate-600/30',
    };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize',
        config.style,
        className
      )}
    >
      {config.label}
    </span>
  );
};


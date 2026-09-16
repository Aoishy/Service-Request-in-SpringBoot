import React from 'react';
import { cn } from '../utils/cn';
import type { RequestStatus } from '../types';

interface ProgressBarProps {
  progress: number;
  status: RequestStatus;
  currentStage?: string;
  showPercentage?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  status,
  currentStage,
  showPercentage = true,
  className,
}) => {
  const getBarColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-gradient-to-r from-emerald-500 to-teal-400';
      case 'failed':
        return 'bg-gradient-to-r from-rose-500 to-red-600';
      case 'cancelled':
        return 'bg-slate-600';
      case 'processing':
        return 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500';
      case 'pending':
      default:
        return 'bg-amber-500/50';
    }
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex justify-between items-center text-xs font-medium text-slate-400">
        <span className="truncate max-w-[200px]">
          {status === 'processing' && currentStage ? (
            <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-ping" />
              Stage: {currentStage}
            </span>
          ) : (
            currentStage || 'Waiting to start'
          )}
        </span>
        {showPercentage && (
          <span className="font-mono text-slate-300">{Math.round(progress)}%</span>
        )}
      </div>

      <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out shadow-sm',
            getBarColor(),
            status === 'processing' && 'animate-pulse'
          )}
          style={{ width: `${Math.max(3, Math.min(100, progress))}%` }}
        />
      </div>
    </div>
  );
};

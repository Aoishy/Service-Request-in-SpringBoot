import React from 'react';
import { cn } from '../utils/cn';

interface LiveIndicatorProps {
  isConnected: boolean;
  className?: string;
}

export const LiveIndicator: React.FC<LiveIndicatorProps> = ({ isConnected, className }) => {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border shadow-sm',
        isConnected
          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-950/20'
          : 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-950/20',
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {isConnected && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={cn(
            'relative inline-flex rounded-full h-2 w-2',
            isConnected ? 'bg-emerald-500' : 'bg-rose-500'
          )}
        />
      </span>
      <span>{isConnected ? 'LIVE FEED ACTIVE' : 'DISCONNECTED'}</span>
    </div>
  );
};

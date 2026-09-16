
import React from 'react';
import type { IServiceRequest } from '../types';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { ProgressBar } from './ProgressBar';
import { Ban, Eye, Trash2, User } from 'lucide-react';
import { useCancelRequestMutation, useDeleteRequestMutation } from '../api/requests';

interface RequestCardProps {
  request: IServiceRequest;
  onViewDetails: (id: number) => void;
  showCancel?: boolean;
}

export const RequestCard: React.FC<RequestCardProps> = ({
  request,
  onViewDetails,
  showCancel = true,
}) => {
  const cancelMutation = useCancelRequestMutation();
  const deleteMutation = useDeleteRequestMutation();
  const normalizedStatus = String(request.status).toLowerCase();

  const isCancellable =
    showCancel &&
    (normalizedStatus === 'pending' || normalizedStatus === 'processing');

  const isDeletable =
    normalizedStatus === 'completed' ||
    normalizedStatus === 'failed' ||
    normalizedStatus === 'cancelled';

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (confirm(`Cancel request "${request.title}"?`)) {
      cancelMutation.mutate(request.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (confirm(`Delete request "${request.title}"?`)) {
      deleteMutation.mutate(request.id);
    }
  };

  return (
    <div
      onClick={() => onViewDetails(request.id)}
      className="group relative bg-[#141628]/90 hover:bg-[#181a30] transition-all duration-200 rounded-xl p-5 border border-slate-800/90 hover:border-indigo-500/40 shadow-lg hover:shadow-indigo-500/5 cursor-pointer flex flex-col justify-between gap-4"
    >
      {/* Top row */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <StatusBadge status={request.status} />
            <PriorityBadge priority={request.priority} />
          </div>

          <span className="text-[11px] font-mono text-slate-500">
            {new Date(request.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        <h3 className="text-base font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-1">
          {request.title}
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
          {request.description}
        </p>
      </div>

      {/* Progress */}
      <div className="pt-2 border-t border-slate-800/60">
        <ProgressBar
          progress={request.progress}
          status={request.status}
          currentStage={request.currentStage}
        />
      </div>

      {/* Bottom meta & action */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <div className="flex items-center gap-1.5 text-slate-400 truncate max-w-[160px]">
          <User className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
          <span className="truncate">{request.submittedBy}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Cancel */}
          {isCancellable && (
            <button
              onClick={handleCancel}
              disabled={cancelMutation.isPending}
              title="Cancel Request"
              className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors disabled:opacity-50"
            >
              <Ban className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={!isDeletable || deleteMutation.isPending}
            title={
              isDeletable
                ? 'Delete request'
                : 'Cancel the request before deleting it'
            }
            aria-label={`Delete ${request.title}`}
            className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          {/* View details */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(request.id);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};


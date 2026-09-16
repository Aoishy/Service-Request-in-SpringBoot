import React from 'react';
import { useRequestDetailQuery, useProgressLogsQuery, useCancelRequestMutation } from '../api/requests';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { ProgressBar } from './ProgressBar';
import { X, AlertTriangle, CheckCircle, Ban, Calendar, User } from 'lucide-react';

interface RequestDetailModalProps {
  requestId: number | null;
  onClose: () => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({ requestId, onClose }) => {
  const { data: request, isLoading } = useRequestDetailQuery(requestId ?? undefined);
  const { data: logs } = useProgressLogsQuery(requestId ?? undefined);
  const cancelMutation = useCancelRequestMutation();

  if (!requestId) return null;

  const isCancellable = request && (request.status === 'pending' || request.status === 'processing');

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this service request?')) {
      cancelMutation.mutate(requestId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#141628] border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#171a30]">
          <div>
            <span className="text-xs font-mono text-indigo-400">ID: {requestId}</span>
            <h2 className="text-lg font-bold text-slate-100 line-clamp-1">
              {isLoading ? 'Loading request...' : request?.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-slate-400 animate-pulse">
              Fetching request lifecycle data...
            </div>
          ) : request ? (
            <>
              {/* Badges & Meta */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#1b1e36] rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <StatusBadge status={request.status} />
                  <PriorityBadge priority={request.priority} />
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" /> {request.submittedBy}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />{' '}
                    {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Progress section */}
              <div className="p-4 bg-[#1b1e36] rounded-xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Live Execution Progress
                </h4>
                <ProgressBar
                  progress={request.progress}
                  status={request.status}
                  currentStage={request.currentStage}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Description
                </h4>
                <div className="p-4 bg-[#101221] rounded-xl border border-slate-800/80 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {request.description}
                </div>
              </div>

              {/* Error Box if failed */}
              {request.errorMessage && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3 text-rose-300 text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold">Processing Failure</div>
                    <div className="text-xs text-rose-300/80 mt-0.5">{request.errorMessage}</div>
                  </div>
                </div>
              )}

              {/* Timeline / Progress Audit Log */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Background Processing Audit Log</span>
                  <span className="text-[10px] text-indigo-400 font-mono">
                    {logs?.length || 0} stage checkpoints
                  </span>
                </h4>

                <div className="bg-[#101221] rounded-xl border border-slate-800/80 p-4 divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
                  {!logs || logs.length === 0 ? (
                    <div className="text-xs text-slate-500 py-3 text-center">
                      No progress checkpoints logged yet.
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3 text-xs">
                        <div className="mt-0.5 p-1 rounded bg-indigo-500/10 text-indigo-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{log.stage}</span>
                            <span className="font-mono text-[10px] text-slate-500">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-slate-400">{log.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-rose-400">Request not found.</div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-[#171a30] flex justify-between items-center">
          <div>
            {isCancellable && (
              <button
                onClick={handleCancel}
                disabled={cancelMutation.isPending}
                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <Ban className="w-3.5 h-3.5" />
                {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Request'}
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

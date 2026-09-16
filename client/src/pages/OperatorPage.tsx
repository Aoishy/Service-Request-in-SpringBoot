import React, { useState } from 'react';
import { useRequestsQuery } from '../api/requests';
import { useRoleStore } from '../store/roleStore';
import { RequestForm } from '../components/RequestForm';
import { RequestCard } from '../components/RequestCard';
import { RequestDetailModal } from '../components/RequestDetailModal';
import { Inbox, RefreshCcw } from 'lucide-react';

export const OperatorPage: React.FC = () => {
  const { operatorName } = useRoleStore();
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);

  // Operator view defaults to viewing their own submitted requests or all
  const [filterMyRequests, setFilterMyRequests] = useState(true);

  const { data, isLoading, refetch, isFetching } = useRequestsQuery({
    submittedBy: filterMyRequests ? operatorName : undefined,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Section: Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <RequestForm onSuccess={() => refetch()} />
        </div>

        <div className="lg:col-span-5 bg-[#141628]/70 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Operator Overview
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            As an operator, you submit complex processing requests. Once submitted, requests are
            immediately acknowledged by the API and processed in the background by Worker Threads.
          </p>
          <div className="p-3.5 bg-[#1b1e36] rounded-xl border border-slate-700/60 text-xs text-indigo-300 space-y-1">
            <div className="font-semibold">Active Submitter Identity:</div>
            <div className="font-mono text-slate-200">{operatorName}</div>
          </div>
          <div className="text-[11px] text-slate-500">
            • Submissions do not freeze or block the API interface.
            <br />
            • Real-time updates reflect live stage changes instantly.
          </div>
        </div>
      </div>

      {/* Submitted Requests List */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Inbox className="w-5 h-5 text-indigo-400" />
              Recent Service Requests
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 rounded-full text-slate-400">
              {data?.pagination.total ?? 0} total
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={filterMyRequests}
                onChange={(e) => setFilterMyRequests(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-indigo-600 focus:ring-0 cursor-pointer"
              />
              Show only my submissions ({operatorName})
            </label>

            <button
              onClick={() => refetch()}
              title="Refresh requests"
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <RefreshCcw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Requests Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-44 bg-[#141628]/50 rounded-xl border border-slate-800 animate-pulse"
              />
            ))}
          </div>
        ) : !data?.items || data.items.length === 0 ? (
          <div className="p-12 text-center bg-[#141628]/40 rounded-2xl border border-dashed border-slate-800 text-slate-400 space-y-2">
            <Inbox className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-medium">No service requests found</p>
            <p className="text-xs text-slate-500">
              Submit your first request above to watch background Worker Threads in action.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.items.map((req) => (
              <RequestCard
                key={req.id}
                request={req}
                onViewDetails={(id) => setSelectedRequestId(id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <RequestDetailModal
        requestId={selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { useRequestsQuery } from '../api/requests';
import { RequestCard } from '../components/RequestCard';
import { RequestDetailModal } from '../components/RequestDetailModal';
import { FilterBar } from '../components/FilterBar';
import { ProgressBar } from '../components/ProgressBar';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { useCancelRequestMutation, useDeleteRequestMutation } from '../api/requests';
import type { ListRequestsQuery } from '../types';
import {
  ShieldAlert,
  Activity,
  Layers,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  RefreshCcw,
  Grid2X2,
  List,
  Eye,
  Ban,
  Trash2,
} from 'lucide-react';

export const SupervisorPage: React.FC = () => {
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [filters, setFilters] = useState<ListRequestsQuery>({
    page: 1,
    limit: 12,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading, refetch, isFetching } = useRequestsQuery(filters);
  const cancelMutation = useCancelRequestMutation();
  const deleteMutation = useDeleteRequestMutation();

  // Quick KPI calculation from loaded items
  const items = data?.items || [];
  const activeCount = items.filter((r) => r.status === 'processing').length;
  const pendingCount = items.filter((r) => r.status === 'pending').length;
  const completedCount = items.filter((r) => r.status === 'completed').length;
  const failedCount = items.filter((r) => r.status === 'failed').length;

  const handleCancel = (requestId: number, title: string) => {
    if (confirm(`Cancel request "${title}"?`)) {
      cancelMutation.mutate(requestId);
    }
  };

  const handleDelete = (requestId: number, title: string) => {
    if (confirm(`Delete request "${title}"?`)) deleteMutation.mutate(requestId);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#141628]/80 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Processing Active
            </div>
            <div className="text-2xl font-black text-indigo-400 font-mono mt-1 flex items-center gap-2">
              {activeCount}
              {activeCount > 0 && (
                <span className="inline-block w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              )}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#141628]/80 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Queue Pending
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-1">
              {pendingCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#141628]/80 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Completed Tasks
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono mt-1">
              {completedCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#141628]/80 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Failed / Alerts
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono mt-1">
              {failedCount}
            </div>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
        onReset={() =>
          setFilters({ page: 1, limit: 12, sortBy: 'createdAt', sortOrder: 'desc' })
        }
      />

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          Live Request Fleet Monitor
          <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 rounded-full text-slate-400">
            {data?.pagination.total ?? 0} total
          </span>
        </h2>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center bg-slate-900/80 border border-slate-700/60 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              title="Card grid view"
              aria-label="Card grid view"
              aria-pressed={viewMode === 'grid'}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Grid2X2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="Table view"
              aria-label="Table view"
              aria-pressed={viewMode === 'table'}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'table' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => refetch()}
            title="Force refresh"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700/60 transition-colors"
          >
            <RefreshCcw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Fleet View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="h-44 bg-[#141628]/50 rounded-xl border border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center bg-[#141628]/40 rounded-2xl border border-dashed border-slate-800 text-slate-400 space-y-2">
          <Layers className="w-10 h-10 mx-auto text-slate-600" />
          <p className="text-sm font-medium">No service requests match the current filters</p>
          <p className="text-xs text-slate-500">
            Adjust search criteria or switch to Operator view to create requests.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onViewDetails={(id) => setSelectedRequestId(id)}
            />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto bg-[#141628]/80 border border-slate-800/80 rounded-xl shadow-lg">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="border-b border-slate-800 bg-[#171a30] text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Request</th>
                <th className="px-4 py-3 font-semibold">Submitter</th>
                <th className="px-4 py-3 font-semibold">Priority</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold w-52">Progress</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {items.map((req) => {
                const isCancellable = req.status === 'pending' || req.status === 'processing';
                const isDeletable = req.status === 'completed' || req.status === 'failed' || req.status === 'cancelled';
                return (
                  <tr key={req.id} className="hover:bg-[#181a30] transition-colors">
                    <td className="px-4 py-3 max-w-[250px]">
                      <button
                        onClick={() => setSelectedRequestId(req.id)}
                        className="text-left font-semibold text-slate-200 hover:text-indigo-300 truncate max-w-full block"
                      >
                        {req.title}
                      </button>
                      <p className="text-slate-500 truncate mt-1">{req.currentStage || 'Waiting in queue'}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{req.submittedBy}</td>
                    <td className="px-4 py-3"><PriorityBadge priority={req.priority} /></td>
                    <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
                    <td className="px-4 py-3"><ProgressBar progress={req.progress} status={req.status} currentStage={req.currentStage} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {isCancellable && (
                          <button
                            onClick={() => handleCancel(req.id, req.title)}
                            disabled={cancelMutation.isPending}
                            title="Cancel request"
                            aria-label={`Cancel ${req.title}`}
                            className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/10 disabled:opacity-50"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(req.id, req.title)}
                          disabled={!isDeletable || deleteMutation.isPending}
                          title={isDeletable ? 'Delete request' : 'Cancel the request before deleting it'}
                          aria-label={`Delete ${req.title}`}
                          className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/10 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedRequestId(req.id)}
                          title="View request details"
                          aria-label={`View details for ${req.title}`}
                          className="p-1.5 rounded-md text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Footer */}
      {data?.pagination && data.pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-4 text-xs text-slate-400">
          <div>
            Showing page {data.pagination.page} of {data.pagination.totalPages} (
            {data.pagination.total} requests)
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={data.pagination.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300 px-2">{data.pagination.page}</span>
            <button
              disabled={data.pagination.page >= data.pagination.totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-lg text-slate-200 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <RequestDetailModal
        requestId={selectedRequestId}
        onClose={() => setSelectedRequestId(null)}
      />
    </div>
  );
};

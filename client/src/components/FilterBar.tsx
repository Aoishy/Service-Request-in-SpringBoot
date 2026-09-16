import React from 'react';
import type { ListRequestsQuery, RequestPriority, RequestStatus } from '../types';
import { Search, Filter, RefreshCw } from 'lucide-react';

interface FilterBarProps {
  filters: ListRequestsQuery;
  onFilterChange: (filters: ListRequestsQuery) => void;
  onReset: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="bg-[#141628]/80 backdrop-blur-md p-4 rounded-xl border border-slate-800/80 shadow-lg space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search title or description..."
            value={filters.search || ''}
            onChange={(e) => onFilterChange({ ...filters, search: e.target.value, page: 1 })}
            className="w-full bg-[#1c1f38] border border-slate-700/60 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={filters.status || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                status: (e.target.value as RequestStatus) || '',
                page: 1,
              })
            }
            className="w-full bg-[#1c1f38] border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/80 transition-colors appearance-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Priority Filter */}
        <div className="relative">
          <select
            value={filters.priority || ''}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                priority: (e.target.value as RequestPriority) || '',
                page: 1,
              })
            }
            className="w-full bg-[#1c1f38] border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500/80 transition-colors appearance-none cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Submitter filter & Reset */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Operator name..."
            value={filters.submittedBy || ''}
            onChange={(e) => onFilterChange({ ...filters, submittedBy: e.target.value, page: 1 })}
            className="w-full bg-[#1c1f38] border border-slate-700/60 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition-colors"
          />
          <button
            onClick={onReset}
            title="Reset Filters"
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700/60 transition-colors flex items-center justify-center shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

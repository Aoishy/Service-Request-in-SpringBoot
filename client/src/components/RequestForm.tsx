import React, { useState } from 'react';
import { useCreateRequestMutation } from '../api/requests';
import { useRoleStore } from '../store/roleStore';
import type { RequestPriority } from '../types';
import { PlusCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

interface RequestFormProps {
  onSuccess?: () => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({ onSuccess }) => {
  const { operatorName } = useRoleStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<RequestPriority>('medium');
  const [submittedBy, setSubmittedBy] = useState(operatorName);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const createMutation = useCreateRequestMutation();

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters.';
    } else if (title.trim().length > 100) {
      errors.title = 'Title cannot exceed 100 characters.';
    }

    if (!description.trim() || description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters.';
    } else if (description.trim().length > 1000) {
      errors.description = 'Description cannot exceed 1000 characters.';
    }

    if (!submittedBy.trim() || submittedBy.trim().length < 2) {
      errors.submittedBy = 'Submitter name must be at least 2 characters.';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    createMutation.mutate(
      {
        title: title.trim(),
        description: description.trim(),
        priority,
        submittedBy: submittedBy.trim(),
      },
      {
        onSuccess: () => {
          setTitle('');
          setDescription('');
          setPriority('medium');
          setValidationErrors({});
          setShowSuccessToast(true);
          setTimeout(() => setShowSuccessToast(false), 3000);
          onSuccess?.();
        },
      }
    );
  };

  const handleQuickPreset = (presetTitle: string, presetDesc: string, presetPriority: RequestPriority) => {
    setTitle(presetTitle);
    setDescription(presetDesc);
    setPriority(presetPriority);
    setValidationErrors({});
  };

  return (
    <div className="bg-[#141628]/90 backdrop-blur-md rounded-2xl border border-slate-800/80 p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-indigo-400" />
            Submit Service Request
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dispatches a CPU-intensive background job to Node.js Worker Threads
          </p>
        </div>

        {showSuccessToast && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold animate-fade-in">
            <CheckCircle2 className="w-4 h-4" /> Dispatched!
          </div>
        )}
      </div>

      {/* Quick Demo Presets */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Quick Presets:
        </span>
        <button
          type="button"
          onClick={() =>
            handleQuickPreset(
              'Database Index Defragmentation & Re-indexing',
              'Perform intensive B-tree index rebuild, disk defragmentation, and statistics gathering across the production catalog cluster.',
              'high'
            )
          }
          className="text-[11px] px-2.5 py-1 bg-slate-800/80 hover:bg-indigo-950/40 hover:text-indigo-300 border border-slate-700/60 rounded-md text-slate-300 transition-colors"
        >
          DB Defrag
        </button>
        <button
          type="button"
          onClick={() =>
            handleQuickPreset(
              'Quarterly Financial Audit Report Generation',
              'Aggregate revenue data from 12 ledger streams, compute tax delta metrics, and generate compliant signed PDF statements.',
              'critical'
            )
          }
          className="text-[11px] px-2.5 py-1 bg-slate-800/80 hover:bg-indigo-950/40 hover:text-indigo-300 border border-slate-700/60 rounded-md text-slate-300 transition-colors"
        >
          Financial Audit
        </button>
        <button
          type="button"
          onClick={() =>
            handleQuickPreset(
              'User Asset Media Transcoding & Compression',
              'Batch transcode 4K customer training videos into multi-bitrate HLS streams with automated thumbnail extraction.',
              'medium'
            )
          }
          className="text-[11px] px-2.5 py-1 bg-slate-800/80 hover:bg-indigo-950/40 hover:text-indigo-300 border border-slate-700/60 rounded-md text-slate-300 transition-colors"
        >
          Media Transcoding
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Request Title *
          </label>
          <input
            type="text"
            placeholder="e.g. Infrastructure Load Balancer Sync"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#1c1f38] border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          {validationErrors.title && (
            <p className="text-rose-400 text-xs mt-1">{validationErrors.title}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Detailed Description *
          </label>
          <textarea
            rows={3}
            placeholder="Provide context, parameters, and requirements for this service task..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-[#1c1f38] border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />
          {validationErrors.description && (
            <p className="text-rose-400 text-xs mt-1">{validationErrors.description}</p>
          )}
        </div>

        {/* Priority & Submitter Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Priority Level *
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as RequestPriority)}
              className="w-full bg-[#1c1f38] border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical (Immediate)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Operator / Submitter Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Alex Mercer"
              value={submittedBy}
              onChange={(e) => setSubmittedBy(e.target.value)}
              className="w-full bg-[#1c1f38] border border-slate-700/70 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {validationErrors.submittedBy && (
              <p className="text-rose-400 text-xs mt-1">{validationErrors.submittedBy}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={createMutation.isPending}
          className="w-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200 flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
        >
          {createMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting & Dispatching Worker...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4" />
              Dispatch Background Service Request
            </>
          )}
        </button>
      </form>
    </div>
  );
};

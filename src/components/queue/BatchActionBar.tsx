import React from 'react';
import { CheckSquare, ShieldCheck, ArrowUpRight, Ban, EyeOff, Trash2 } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';
import { IncidentStatus } from '../../types/incident';

export const BatchActionBar: React.FC<{
  selectedIds: string[];
  onClearSelection: () => void;
}> = ({ selectedIds, onClearSelection }) => {
  const { batchUpdateStatus } = useIncidents();

  if (selectedIds.length === 0) return null;

  const handleStatusChange = (status: IncidentStatus) => {
    batchUpdateStatus(selectedIds, status);
    onClearSelection();
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-slate-900 border border-cyan-500/50 rounded-xl px-5 py-3 shadow-2xl shadow-cyan-950/50 backdrop-blur-lg flex items-center gap-4 animate-slide-up">
      <div className="flex items-center gap-2 font-mono text-xs text-white border-r border-slate-700 pr-4">
        <CheckSquare className="w-4 h-4 text-cyan-400" />
        <span className="font-bold">{selectedIds.length}</span>
        <span className="text-slate-400">incidents selected</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => handleStatusChange('MITIGATED')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Batch Mitigate</span>
        </button>

        <button
          onClick={() => handleStatusChange('ESCALATED')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-300 border border-purple-500/40 text-xs font-mono font-semibold transition-colors"
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
          <span>Escalate to CIRT</span>
        </button>

        <button
          onClick={() => handleStatusChange('SUPPRESSED')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
        >
          <EyeOff className="w-3.5 h-3.5 text-slate-400" />
          <span>Suppress</span>
        </button>
      </div>

      <button
        onClick={onClearSelection}
        className="text-xs font-mono text-slate-400 hover:text-white pl-2 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
};

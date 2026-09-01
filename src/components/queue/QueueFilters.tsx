import React from 'react';
import { 
  Search, 
  Filter, 
  X, 
  Network, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Layers
} from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';
import { RiskLevel, IncidentStatus, AttackCategory } from '../../types/incident';

export const QueueFilters: React.FC = () => {
  const { filters, setFilters, incidents } = useIncidents();

  const riskLevels: RiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  const statuses: IncidentStatus[] = ['NEW', 'INVESTIGATING', 'ESCALATED', 'MITIGATED', 'SUPPRESSED'];

  const toggleRiskLevel = (level: RiskLevel) => {
    setFilters((prev) => {
      const exists = prev.riskLevels.includes(level);
      return {
        ...prev,
        riskLevels: exists ? prev.riskLevels.filter((r) => r !== level) : [...prev.riskLevels, level],
      };
    });
  };

  const toggleStatus = (status: IncidentStatus) => {
    setFilters((prev) => {
      const exists = prev.statuses.includes(status);
      return {
        ...prev,
        statuses: exists ? prev.statuses.filter((s) => s !== status) : [...prev.statuses, status],
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      riskLevels: [],
      statuses: [],
      types: [],
      onlyCorrelated: false,
      sortBy: 'rank',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.riskLevels.length > 0 ||
    filters.statuses.length > 0 ||
    filters.onlyCorrelated;

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
      {/* Top row: Search and Fast Filters */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, Attack Type, Asset, IP, Identity..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-9 pr-8 py-2 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Toggles */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Correlated Only Toggle */}
          <button
            onClick={() => setFilters((prev) => ({ ...prev, onlyCorrelated: !prev.onlyCorrelated }))}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
              filters.onlyCorrelated
                ? 'bg-purple-950 text-purple-300 border-purple-500/50 shadow-[0_0_10px_rgba(168,85,247,0.2)] font-semibold'
                : 'bg-slate-900 text-slate-400 border-slate-700 hover:border-slate-600'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-purple-400" />
            <span>Attack Chain Only</span>
          </button>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Risk Level Chips and Status Chips */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        {/* Risk Level Chips */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] font-mono text-slate-500 mr-1 uppercase">Risk:</span>
          {riskLevels.map((lvl) => {
            const isSelected = filters.riskLevels.includes(lvl);
            const count = incidents.filter((i) => i.riskLevel === lvl).length;
            const badgeColors = {
              CRITICAL: isSelected
                ? 'bg-red-900 text-red-100 border-red-500 font-bold shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                : 'bg-red-950/40 text-red-400 border-red-900/60 hover:border-red-600',
              HIGH: isSelected
                ? 'bg-orange-900 text-orange-100 border-orange-500 font-bold shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                : 'bg-orange-950/40 text-orange-400 border-orange-900/60 hover:border-orange-600',
              MEDIUM: isSelected
                ? 'bg-yellow-900 text-yellow-100 border-yellow-500 font-bold'
                : 'bg-yellow-950/40 text-yellow-400 border-yellow-900/60 hover:border-yellow-600',
              LOW: isSelected
                ? 'bg-emerald-900 text-emerald-100 border-emerald-500 font-bold'
                : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60 hover:border-emerald-600',
            };

            return (
              <button
                key={lvl}
                onClick={() => toggleRiskLevel(lvl)}
                className={`text-[11px] font-mono px-2.5 py-1 rounded border transition-all ${badgeColors[lvl]}`}
              >
                {lvl} ({count})
              </button>
            );
          })}
        </div>

        {/* Status Chips */}
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-[11px] font-mono text-slate-500 mr-1 uppercase">Status:</span>
          {statuses.map((st) => {
            const isSelected = filters.statuses.includes(st);
            return (
              <button
                key={st}
                onClick={() => toggleStatus(st)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all ${
                  isSelected
                    ? 'bg-cyan-900 text-cyan-100 border-cyan-400 font-bold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  ListOrdered, 
  ArrowUpDown, 
  Download, 
  Flame, 
  RefreshCw, 
  ShieldCheck, 
  SlidersHorizontal,
  Info
} from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';
import { Incident } from '../../types/incident';
import { IncidentRow } from './IncidentRow';
import { QueueFilters } from './QueueFilters';
import { BatchActionBar } from './BatchActionBar';

export const IncidentQueueTable: React.FC<{
  onSelectIncident: (inc: Incident) => void;
  onCompareIncidents: (a: Incident, b: Incident) => void;
}> = ({ onSelectIncident, onCompareIncidents }) => {
  const { incidents, filters, updateIncidentStatus, simulateBatchAlerts } = useIncidents();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Apply filters to incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
      // Search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matches =
          inc.id.toLowerCase().includes(query) ||
          inc.type.toLowerCase().includes(query) ||
          inc.asset.toLowerCase().includes(query) ||
          inc.user.toLowerCase().includes(query) ||
          inc.sourceIp.toLowerCase().includes(query) ||
          (inc.mitreId && inc.mitreId.toLowerCase().includes(query));
        if (!matches) return false;
      }

      // Risk levels filter
      if (filters.riskLevels.length > 0 && !filters.riskLevels.includes(inc.riskLevel)) {
        return false;
      }

      // Status filter
      if (filters.statuses.length > 0 && !filters.statuses.includes(inc.status)) {
        return false;
      }

      // Attack Category filter
      if (filters.types.length > 0 && !filters.types.includes(inc.type)) {
        return false;
      }

      // Only Correlated filter
      if (filters.onlyCorrelated && inc.correlatedIncidentIds.length === 0) {
        return false;
      }

      return true;
    });
  }, [incidents, filters]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredIncidents.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredIncidents.map((i) => i.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <QueueFilters />

      {/* Table Container */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        {/* Table Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ListOrdered className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Deterministic Priority Ranking Queue
            </h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
              Showing {filteredIncidents.length} of {incidents.length}
            </span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400" />
            <span>Ranked: Score → Correlation → Severity → Asset → Time</span>
          </div>
        </div>

        {/* Scrollable Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-12">
                  <input
                    type="checkbox"
                    checked={filteredIncidents.length > 0 && selectedIds.length === filteredIncidents.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="py-3 px-3">Incident ID</th>
                <th className="py-3 px-3">Incident Type</th>
                <th className="py-3 px-3">Asset</th>
                <th className="py-3 px-3">Affected User</th>
                <th className="py-3 px-3">Source IP</th>
                <th className="py-3 px-3">Priority Score</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-3">Correlation</th>
                <th className="py-3 px-3">Time</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-500 text-xs font-mono">
                    No incidents match the active filter criteria. Try resetting filters or simulating alerts.
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident, index) => {
                  const previousIncident = index > 0 ? filteredIncidents[index - 1] : undefined;
                  return (
                    <IncidentRow
                      key={incident.id}
                      incident={incident}
                      previousIncident={previousIncident}
                      isSelected={selectedIds.includes(incident.id)}
                      onToggleSelect={toggleSelectRow}
                      onClickRow={onSelectIncident}
                      onCompareWithPrevious={onCompareIncidents}
                      onQuickMitigate={(id) => updateIncidentStatus(id, 'MITIGATED', 'Quick mitigation applied via SOC queue.')}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Click any row to open the Explainable Scoring Side Panel & Root Cause Breakdown.</span>
          </div>
          <span>Weighted Multi-Factor Formula (CVSS/Asset/Data/Impact/Fidelity/Blast/Graph)</span>
        </div>
      </div>

      {/* Floating Batch Action Bar */}
      <BatchActionBar
        selectedIds={selectedIds}
        onClearSelection={() => setSelectedIds([])}
      />
    </div>
  );
};

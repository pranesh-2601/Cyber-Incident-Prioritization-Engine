import React, { useEffect, useMemo, useState } from 'react';
import { Info, ListOrdered } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';
import { Incident } from '../../types/incident';
import { IncidentRow } from './IncidentRow';
import { QueueFilters } from './QueueFilters';
import { BatchActionBar } from './BatchActionBar';

export const IncidentQueueTable: React.FC<{
  onOpenIncidentDetail: (inc: Incident) => void;
  onExplainIncident: (inc: Incident) => void;
  onCompareIncidents: (a: Incident, b: Incident) => void;
}> = ({ onOpenIncidentDetail, onExplainIncident, onCompareIncidents }) => {
  const { incidents, filters, updateIncidentStatus } = useIncidents();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filteredIncidents = useMemo(() => {
    return incidents.filter((inc) => {
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

      if (filters.riskLevels.length > 0 && !filters.riskLevels.includes(inc.riskLevel)) return false;
      if (filters.statuses.length > 0 && !filters.statuses.includes(inc.status)) return false;
      if (filters.types.length > 0 && !filters.types.includes(inc.type)) return false;
      if (filters.onlyCorrelated && inc.correlatedIncidentIds.length === 0) return false;

      return true;
    });
  }, [incidents, filters]);

  useEffect(() => {
    const validIds = new Set(incidents.map((incident) => incident.id));
    setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [incidents]);

  const allVisibleSelected = filteredIncidents.length > 0 && filteredIncidents.every((incident) => selectedIds.includes(incident.id));

  const toggleSelectAll = () => {
    const visibleIds = filteredIncidents.map((incident) => incident.id);
    const visibleIdSet = new Set(visibleIds);
    if (allVisibleSelected) setSelectedIds((prev) => prev.filter((id) => !visibleIdSet.has(id)));
    else setSelectedIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      <QueueFilters />

      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-950/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <ListOrdered className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Incident Priority Queue</h2>
            <span className="text-[11px] text-slate-500">What should the security team investigate first?</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Showing {filteredIncidents.length} of {incidents.length}</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-400" />
            <span>Higher score = investigate sooner</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4 w-12"><input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer" /></th>
                <th className="py-3 px-3">Incident ID</th>
                <th className="py-3 px-3">What Happened?</th>
                <th className="py-3 px-3">Targeted System</th>
                <th className="py-3 px-3">User / Account</th>
                <th className="py-3 px-3">Attack Source</th>
                <th className="py-3 px-3">Priority Score</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-3">Connected Alerts</th>
                <th className="py-3 px-3">Detected</th>
                <th className="py-3 px-3">Current State</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {filteredIncidents.length === 0 ? (
                <tr><td colSpan={12} className="py-12 text-center text-slate-500 text-xs font-mono">No incidents match the selected filters. Clear the filters or simulate new alerts.</td></tr>
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
                      onOpenDetail={onOpenIncidentDetail}
                      onExplainRank={onExplainIncident}
                      onCompareWithPrevious={onCompareIncidents}
                      onQuickMitigate={(id) => updateIncidentStatus(id, 'MITIGATED', 'Quick mitigation applied via SOC queue.')}
                    />
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-slate-800/80 bg-slate-950/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-1.5"><Info className="w-3.5 h-3.5 text-cyan-400" /><span>Click any incident to open full details, response actions, and activity history.</span></div>
          <span className="font-mono">Use the brain icon to see why the incident received its score and rank</span>
        </div>
      </div>

      <BatchActionBar selectedIds={selectedIds} onClearSelection={() => setSelectedIds([])} />
    </div>
  );
};

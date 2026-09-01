import React from 'react';
import { 
  Network, 
  ChevronRight, 
  Clock, 
  User, 
  Server, 
  ExternalLink, 
  GitCompare, 
  ShieldAlert,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import { Incident } from '../../types/incident';
import { RiskBadge, StatusBadge, AssetTierBadge } from '../common/Badge';
import { ScoreGauge } from '../common/ScoreGauge';

interface IncidentRowProps {
  incident: Incident;
  previousIncident?: Incident;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onClickRow: (incident: Incident) => void;
  onCompareWithPrevious?: (incidentA: Incident, incidentB: Incident) => void;
  onQuickMitigate: (id: string) => void;
}

export const IncidentRow: React.FC<IncidentRowProps> = ({
  incident,
  previousIncident,
  isSelected,
  onToggleSelect,
  onClickRow,
  onCompareWithPrevious,
  onQuickMitigate,
}) => {
  const isCritical = incident.riskLevel === 'CRITICAL';
  const isHigh = incident.riskLevel === 'HIGH';

  // Format time relative or concise
  const formattedTime = new Date(incident.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  return (
    <tr
      className={`group border-b border-slate-800/80 transition-all duration-150 cursor-pointer ${
        isSelected
          ? 'bg-cyan-950/30 border-cyan-500/40'
          : incident.isNewAlert
          ? 'bg-red-950/20 hover:bg-slate-800/60'
          : 'hover:bg-slate-900/80 bg-slate-950/40'
      }`}
    >
      {/* Checkbox & Rank */}
      <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(incident.id)}
            className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-cyan-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
          />
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-xs ${
              isCritical
                ? 'bg-red-950 text-red-300 border border-red-500/50 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                : isHigh
                ? 'bg-orange-950 text-orange-300 border border-orange-500/50'
                : 'bg-slate-900 text-slate-400 border border-slate-800'
            }`}
          >
            #{incident.rank}
          </div>
        </div>
      </td>

      {/* Incident ID & MITRE */}
      <td className="py-3 px-3" onClick={() => onClickRow(incident)}>
        <div className="font-mono text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
          {incident.id}
        </div>
        {incident.mitreId && (
          <div className="text-[10px] font-mono text-cyan-400/80 mt-0.5 flex items-center gap-1">
            <span>{incident.mitreId}</span>
          </div>
        )}
      </td>

      {/* Attack Type & Description Preview */}
      <td className="py-3 px-3 min-w-[180px] max-w-[240px]" onClick={() => onClickRow(incident)}>
        <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
          <span>{incident.type}</span>
        </div>
        <div className="text-[11px] text-slate-400 truncate mt-0.5 font-sans">
          {incident.description}
        </div>
      </td>

      {/* Target Asset & Tier */}
      <td className="py-3 px-3" onClick={() => onClickRow(incident)}>
        <div className="text-xs font-mono font-medium text-slate-200 truncate flex items-center gap-1.5">
          <Server className="w-3 h-3 text-slate-400 shrink-0" />
          <span className="truncate">{incident.asset}</span>
        </div>
        <div className="mt-1">
          <AssetTierBadge tier={incident.assetTier} />
        </div>
      </td>

      {/* Affected User */}
      <td className="py-3 px-3" onClick={() => onClickRow(incident)}>
        <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
          <User className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{incident.user}</span>
        </div>
        {incident.userRole && (
          <div className="text-[10px] text-slate-500 truncate max-w-[110px]">
            {incident.userRole}
          </div>
        )}
      </td>

      {/* Source IP */}
      <td className="py-3 px-3 font-mono text-xs text-cyan-400" onClick={() => onClickRow(incident)}>
        <div className="truncate">{incident.sourceIp}</div>
        {incident.destinationIp && (
          <div className="text-[10px] text-slate-500 truncate">
            → {incident.destinationIp}
          </div>
        )}
      </td>

      {/* Priority Score Gauge */}
      <td className="py-3 px-3" onClick={() => onClickRow(incident)}>
        <div className="flex items-center gap-2">
          <ScoreGauge score={incident.priorityScore} size="sm" showLabel={false} />
          <div>
            <div className="font-mono text-xs font-extrabold text-white">
              {incident.priorityScore}
            </div>
            <div className="text-[9px] font-mono text-slate-500 uppercase">
              / 100
            </div>
          </div>
        </div>
      </td>

      {/* Risk Level Badge */}
      <td className="py-3 px-3" onClick={() => onClickRow(incident)}>
        <RiskBadge level={incident.riskLevel} size="sm" />
      </td>

      {/* Correlation Badge */}
      <td className="py-3 px-3" onClick={() => onClickRow(incident)}>
        {incident.correlatedIncidentIds.length > 0 ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-950/80 text-purple-300 border border-purple-500/40 text-[11px] font-mono font-semibold shadow-sm">
            <Network className="w-3 h-3 text-purple-400" />
            <span>{incident.correlatedIncidentIds.length} Linked</span>
          </span>
        ) : (
          <span className="text-[11px] font-mono text-slate-500">Isolated</span>
        )}
      </td>

      {/* Time */}
      <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap" onClick={() => onClickRow(incident)}>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>{formattedTime}</span>
        </div>
      </td>

      {/* Status */}
      <td className="py-3 px-3" onClick={() => onClickRow(incident)}>
        <StatusBadge status={incident.status} />
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1.5">
          {/* Compare with previous row if available */}
          {previousIncident && onCompareWithPrevious && (
            <button
              onClick={() => onCompareWithPrevious(previousIncident, incident)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors"
              title={`Compare #${previousIncident.rank} with #${incident.rank}`}
            >
              <GitCompare className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Mitigate */}
          {incident.status !== 'MITIGATED' && (
            <button
              onClick={() => onQuickMitigate(incident.id)}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-emerald-950 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-700/50 transition-colors"
              title="Quick Mitigate Alert"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Open Explainability details */}
          <button
            onClick={() => onClickRow(incident)}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-cyan-950 text-slate-400 hover:text-cyan-400 border border-slate-800 hover:border-cyan-700/50 transition-colors"
            title="Inspect 7-factor explainability"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

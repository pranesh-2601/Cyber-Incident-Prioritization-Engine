import React from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  ShieldAlert, 
  CheckCircle2, 
  Network, 
  Layers, 
  ExternalLink, 
  ArrowUpRight, 
  Flame, 
  Lock,
  GitCompare
} from 'lucide-react';
import { Incident } from '../../types/incident';
import { useIncidents } from '../../context/IncidentContext';
import { generateRankingExplanation } from '../../utils/explainability';
import { Modal } from '../common/Modal';
import { RiskBadge, StatusBadge, AssetTierBadge } from '../common/Badge';
import { ScoreGauge } from '../common/ScoreGauge';
import { FactorBreakdownBar } from './FactorBreakdownBar';

export const ExplainableRankingModal: React.FC<{
  incident: Incident | null;
  onClose: () => void;
  onCompareWithNext?: (current: Incident) => void;
}> = ({ incident, onClose, onCompareWithNext }) => {
  const { incidents, updateIncidentStatus } = useIncidents();

  if (!incident) return null;

  const explanation = generateRankingExplanation(incident, incidents);

  return (
    <Modal
      isOpen={Boolean(incident)}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2 flex-wrap">
          <BrainCircuit className="w-5 h-5 text-cyan-400" />
          <span>Explainable Threat Intelligence Dossier:</span>
          <span className="font-mono text-cyan-300">
            #{incident.rank} {incident.id}
          </span>
          <RiskBadge level={incident.riskLevel} size="sm" />
        </div>
      }
      subtitle={`Comprehensive 7-Factor Mathematical Attribution for ${incident.type} on ${incident.asset}`}
    >
      <div className="space-y-6">
        {/* Top Summary Banner */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ScoreGauge score={incident.priorityScore} size="lg" />
            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">
                Deterministic Priority Ranking
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Rank #{incident.rank} of {incidents.length} Active Incidents
              </h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl font-normal leading-relaxed">
                {explanation.summary}
              </p>
            </div>
          </div>

          {onCompareWithNext && incident.rank && incident.rank < incidents.length && (
            <button
              onClick={() => onCompareWithNext(incident)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition-all shrink-0"
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Compare with #{incident.rank + 1}</span>
            </button>
          )}
        </div>

        {/* Why this incident ranks here: Key Drivers & Correlation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Key Drivers */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Primary Ranking Drivers</span>
            </div>
            <ul className="space-y-2">
              {explanation.keyDrivers.map((driver, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-cyan-400 font-mono mt-0.5">•</span>
                  <span>{driver}</span>
                </li>
              ))}
            </ul>

            {explanation.mitigatingFactors.length > 0 && (
              <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 italic">
                {explanation.mitigatingFactors[0]}
              </div>
            )}
          </div>

          {/* Correlation Story */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase tracking-wider">
              <Network className="w-4 h-4" />
              <span>Correlation & Attack Chain Links</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              {explanation.correlationNarrative}
            </p>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Shared Entities: {incident.sourceIp} / {incident.user}</span>
              <span className="text-purple-400 font-bold">
                {incident.correlatedIncidentIds.length} Connected Alerts
              </span>
            </div>
          </div>
        </div>

        {/* 7-Factor Mathematical Contribution Breakdown */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                7-Factor Weighted Attribution Breakdown (Formula: Sum of (Factor × Weight) × 10)
              </h4>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              Total: {incident.priorityScore} / 100
            </span>
          </div>

          <div className="space-y-2.5">
            {explanation.contributions.map((c) => (
              <FactorBreakdownBar key={c.factor} contribution={c} />
            ))}
          </div>
        </div>

        {/* Forensic Metadata & Playbook Actions */}
        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="text-xs font-mono text-slate-400 uppercase">Recommended Urgency Level</div>
            <div className="text-xs font-semibold text-white">{explanation.recommendedUrgency}</div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {incident.status !== 'MITIGATED' ? (
              <button
                onClick={() => {
                  updateIncidentStatus(incident.id, 'MITIGATED', 'Mitigated after forensic review.');
                  onClose();
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono shadow-md shadow-emerald-950/40 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark as Mitigated</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  updateIncidentStatus(incident.id, 'INVESTIGATING', 'Re-opened for further investigation.');
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
              >
                <span>Reopen Incident</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
            >
              Close Dossier
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

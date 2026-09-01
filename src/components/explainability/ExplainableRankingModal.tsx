import React from 'react';
import { Sparkles, BrainCircuit, CheckCircle2, Network, Layers, GitCompare } from 'lucide-react';
import { Incident } from '../../types/incident';
import { useIncidents } from '../../context/IncidentContext';
import { generateRankingExplanation } from '../../utils/explainability';
import { Modal } from '../common/Modal';
import { RiskBadge } from '../common/Badge';
import { ScoreGauge } from '../common/ScoreGauge';
import { FactorBreakdownBar } from './FactorBreakdownBar';

export const ExplainableRankingModal: React.FC<{
  incident: Incident | null;
  onClose: () => void;
  onCompareWithNext?: (current: Incident) => void;
}> = ({ incident, onClose, onCompareWithNext }) => {
  const { incidents, weights, updateIncidentStatus } = useIncidents();

  if (!incident) return null;

  const explanation = generateRankingExplanation(incident, incidents, weights);

  return (
    <Modal
      isOpen={Boolean(incident)}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2 flex-wrap">
          <BrainCircuit className="w-5 h-5 text-cyan-400" />
          <span>Why this incident is ranked here</span>
          <span className="font-mono text-cyan-300">#{incident.rank} {incident.id}</span>
          <RiskBadge level={incident.riskLevel} size="sm" />
        </div>
      }
      subtitle={`Simple explanation first, technical scoring details below — ${incident.type} on ${incident.asset}`}
    >
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950/20 to-slate-900 border border-cyan-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <ScoreGauge score={incident.priorityScore} size="lg" />
            <div>
              <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Priority Rank</div>
              <h3 className="text-xl font-bold text-white tracking-tight">#{incident.rank} out of {incidents.length} incidents</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">{explanation.summary}</p>
              <p className="text-[11px] text-slate-500 mt-2">Higher rank means the security team should investigate this incident sooner.</p>
            </div>
          </div>

          {onCompareWithNext && incident.rank && incident.rank < incidents.length && (
            <button onClick={() => onCompareWithNext(incident)} className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 text-xs font-mono transition-all shrink-0">
              <GitCompare className="w-3.5 h-3.5" /><span>Why higher than #{incident.rank + 1}?</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider"><Sparkles className="w-4 h-4" /><span>Main reasons for this rank</span></div>
            <p className="text-[11px] text-slate-500">These are the biggest reasons the system considers this incident important.</p>
            <ul className="space-y-2">
              {explanation.keyDrivers.map((driver, i) => (
                <li key={i} className="text-xs text-slate-300 flex items-start gap-2"><span className="text-cyan-400 font-mono mt-0.5">•</span><span>{driver}</span></li>
              ))}
            </ul>
            {explanation.mitigatingFactors.length > 0 && <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 italic">{explanation.mitigatingFactors[0]}</div>}
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-bold uppercase tracking-wider"><Network className="w-4 h-4" /><span>Connected activity / Correlation</span></div>
            <p className="text-[11px] text-slate-500">Correlation means this alert may be part of the same larger attack as other alerts.</p>
            <p className="text-xs text-slate-300 leading-relaxed">{explanation.correlationNarrative}</p>
            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Shared IP/User: {incident.sourceIp} / {incident.user}</span>
              <span className="text-purple-400 font-bold">{incident.correlatedIncidentIds.length} Connected Alerts</span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2"><Layers className="w-4 h-4 text-cyan-400" /><h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider">How the score is calculated</h4></div>
              <p className="text-[11px] text-slate-500 mt-1">Each factor gets a value out of 10. More important factors get more weight. Together they create the final score out of 100.</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold shrink-0">Total: {incident.priorityScore} / 100</span>
          </div>

          <div className="rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-[10px] text-slate-500 font-mono">
            Technical formula: Σ(Factor × Normalized Weight) × 10
          </div>

          <div className="space-y-2.5">{explanation.contributions.map((c) => <FactorBreakdownBar key={c.factor} contribution={c} />)}</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1"><div className="text-xs font-mono text-slate-400 uppercase">What should the SOC team do?</div><div className="text-xs font-semibold text-white">{explanation.recommendedUrgency}</div></div>
          <div className="flex items-center gap-2 flex-wrap">
            {incident.status !== 'MITIGATED' ? (
              <button onClick={() => { updateIncidentStatus(incident.id, 'MITIGATED', 'Mitigated after forensic review.'); onClose(); }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold font-mono shadow-md shadow-emerald-950/40 transition-colors"><CheckCircle2 className="w-3.5 h-3.5" /><span>Mark as Mitigated</span></button>
            ) : (
              <button onClick={() => updateIncidentStatus(incident.id, 'INVESTIGATING', 'Re-opened for further investigation.')} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"><span>Reopen Incident</span></button>
            )}
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors">Close</button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

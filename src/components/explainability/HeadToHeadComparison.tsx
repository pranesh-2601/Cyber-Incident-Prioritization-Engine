import React from 'react';
import { 
  GitCompare, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  Scale,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Incident } from '../../types/incident';
import { compareIncidentsExplainable } from '../../utils/explainability';
import { Modal } from '../common/Modal';
import { RiskBadge } from '../common/Badge';
import { ScoreGauge } from '../common/ScoreGauge';

interface HeadToHeadComparisonProps {
  incidentA: Incident | null;
  incidentB: Incident | null;
  onClose: () => void;
}

export const HeadToHeadComparison: React.FC<HeadToHeadComparisonProps> = ({
  incidentA,
  incidentB,
  onClose,
}) => {
  if (!incidentA || !incidentB) return null;

  const comparison = compareIncidentsExplainable(incidentA, incidentB);
  const { higherIncident, lowerIncident, overallScoreDiff, narrative, deltas, dominantFactor } = comparison;

  return (
    <Modal
      isOpen={Boolean(incidentA && incidentB)}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2 flex-wrap">
          <Scale className="w-5 h-5 text-cyan-400" />
          <span>Head-to-Head Priority Differential Analysis</span>
        </div>
      }
      subtitle={`Explainable Comparative Telemetry: Why #${higherIncident.rank} outranks #${lowerIncident.rank}`}
    >
      <div className="space-y-6">
        {/* Side-by-Side Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Higher Rank Card */}
          <div className="glass-panel p-4 rounded-xl border border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 border border-cyan-500/40 font-bold">
                  OUTRANKS (RANK #{higherIncident.rank})
                </span>
                <span className="font-mono text-xs font-bold text-white">{higherIncident.id}</span>
              </div>
              <RiskBadge level={higherIncident.riskLevel} size="sm" />
            </div>

            <div className="flex items-center gap-4">
              <ScoreGauge score={higherIncident.priorityScore} size="md" />
              <div>
                <div className="text-sm font-bold text-white">{higherIncident.type}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Asset: <span className="text-slate-200">{higherIncident.asset}</span>
                </div>
                <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                  Attacker IP: {higherIncident.sourceIp}
                </div>
              </div>
            </div>
          </div>

          {/* Lower Rank Card */}
          <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-slate-900/60 relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-medium">
                  RANK #{lowerIncident.rank}
                </span>
                <span className="font-mono text-xs font-bold text-slate-300">{lowerIncident.id}</span>
              </div>
              <RiskBadge level={lowerIncident.riskLevel} size="sm" />
            </div>

            <div className="flex items-center gap-4">
              <ScoreGauge score={lowerIncident.priorityScore} size="md" />
              <div>
                <div className="text-sm font-bold text-slate-300">{lowerIncident.type}</div>
                <div className="text-xs text-slate-400 font-mono mt-0.5">
                  Asset: <span className="text-slate-300">{lowerIncident.asset}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Attacker IP: {lowerIncident.sourceIp}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Narrative Reason Box */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-cyan-500/30 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-xs font-mono text-cyan-300 font-bold uppercase tracking-wider">
              Decisive Ranking Differential Explanation
            </div>
            <p className="text-xs text-slate-200 leading-relaxed font-normal">
              {narrative}
            </p>
            <div className="text-[11px] text-slate-400 font-mono pt-1">
              Primary Divergence Vector: <span className="text-cyan-300 font-bold">{dominantFactor}</span> (+{deltas.find(d => d.factor === dominantFactor)?.pointDiff.toFixed(1)} net points)
            </div>
          </div>
        </div>

        {/* Factor-by-Factor Differential Table */}
        <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
            <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              Factor-by-Factor Score Gap Breakdown
            </h4>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              Net Spread: +{overallScoreDiff.toFixed(1)} pts
            </span>
          </div>

          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] text-slate-400 uppercase">
                <th className="py-2.5 px-4">Scoring Factor</th>
                <th className="py-2.5 px-3 text-cyan-300">#{higherIncident.rank} ({higherIncident.id})</th>
                <th className="py-2.5 px-3 text-slate-400">#{lowerIncident.rank} ({lowerIncident.id})</th>
                <th className="py-2.5 px-3 text-right">Point Delta</th>
                <th className="py-2.5 px-4">Attribution Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {deltas.map((d) => {
                const isAdvantage = d.pointDiff > 0;
                const isDeficit = d.pointDiff < 0;

                return (
                  <tr key={d.factorKey} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-4 font-semibold text-slate-200">
                      {d.factor}
                    </td>
                    <td className="py-2.5 px-3 text-white font-bold">
                      {d.incidentAValue}/10
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">
                      {d.incidentBValue}/10
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      {isAdvantage ? (
                        <span className="text-cyan-400">+{d.pointDiff.toFixed(1)}</span>
                      ) : isDeficit ? (
                        <span className="text-red-400">{d.pointDiff.toFixed(1)}</span>
                      ) : (
                        <span className="text-slate-500">0.0</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-[11px] text-slate-300 font-sans">
                      {d.explanation}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </Modal>
  );
};

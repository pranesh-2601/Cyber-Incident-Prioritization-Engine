import React from 'react';
import { ArrowRight, Scale, Sparkles } from 'lucide-react';
import { Incident } from '../../types/incident';
import { compareIncidentsExplainable } from '../../utils/explainability';
import { useIncidents } from '../../context/IncidentContext';
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
  const { weights } = useIncidents();

  if (!incidentA || !incidentB) return null;

  const comparison = compareIncidentsExplainable(incidentA, incidentB, weights);
  const { higherIncident, lowerIncident, overallScoreDiff, narrative, deltas, dominantFactor } = comparison;
  const dominantDelta = deltas.find((delta) => delta.factor === dominantFactor);
  const dominantPointDiff = dominantDelta?.pointDiff ?? 0;

  return (
    <Modal
      isOpen={Boolean(incidentA && incidentB)}
      onClose={onClose}
      maxWidth="4xl"
      title={
        <div className="flex items-center gap-2 flex-wrap">
          <Scale className="w-5 h-5 text-cyan-400" />
          <span>Why #{higherIncident.rank} is higher than #{lowerIncident.rank}</span>
        </div>
      }
      subtitle="Simple answer first. Full technical factor-by-factor comparison below."
    >
      <div className="space-y-6">
        <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/25 via-slate-900 to-slate-900 p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-3 flex-1">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-300">
                  Simple answer
                </div>
                <p className="text-sm text-slate-100 leading-relaxed mt-1">
                  <strong>#{higherIncident.rank} is ranked higher because its total risk score is {higherIncident.priorityScore}, compared with {lowerIncident.priorityScore} for #{lowerIncident.rank}.</strong>{' '}
                  That is a <span className="text-cyan-300 font-bold">{overallScoreDiff.toFixed(1)} point advantage</span>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
                <div className="rounded-lg border border-cyan-500/30 bg-cyan-950/20 p-3">
                  <div className="text-[10px] font-mono text-cyan-300">#{higherIncident.rank} • HIGHER PRIORITY</div>
                  <div className="mt-1 text-sm font-bold text-white">{higherIncident.type}</div>
                  <div className="mt-2 text-2xl font-black font-mono text-white">{higherIncident.priorityScore}</div>
                </div>

                <div className="flex sm:flex-col items-center justify-center gap-1 text-cyan-300">
                  <ArrowRight className="w-4 h-4 hidden sm:block" />
                  <span className="text-xs font-black font-mono">+{overallScoreDiff.toFixed(1)}</span>
                </div>

                <div className="rounded-lg border border-slate-800 bg-slate-950/45 p-3 sm:text-right">
                  <div className="text-[10px] font-mono text-slate-500">#{lowerIncident.rank} • NEXT PRIORITY</div>
                  <div className="mt-1 text-sm font-bold text-slate-300">{lowerIncident.type}</div>
                  <div className="mt-2 text-2xl font-black font-mono text-slate-300">{lowerIncident.priorityScore}</div>
                </div>
              </div>

              <div className="rounded-lg border border-violet-500/20 bg-violet-950/15 px-3 py-2.5">
                <div className="text-[10px] font-mono uppercase text-violet-300">Main reason for the difference</div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  The strongest separating factor is <strong className="text-white">{dominantFactor}</strong>.
                  {dominantDelta
                    ? ` #${higherIncident.rank} scored ${dominantDelta.incidentAValue}/10 while #${lowerIncident.rank} scored ${dominantDelta.incidentBValue}/10, creating about ${Math.abs(dominantPointDiff).toFixed(1)} points of score difference from this factor.`
                    : ''}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-slate-900 shadow-[0_0_15px_rgba(6,182,212,0.15)] relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 border border-cyan-500/40 font-bold">
                  RANK #{higherIncident.rank}
                </span>
                <span className="font-mono text-xs font-bold text-white">{higherIncident.id}</span>
              </div>
              <RiskBadge level={higherIncident.riskLevel} size="sm" />
            </div>

            <div className="flex items-center gap-4">
              <ScoreGauge score={higherIncident.priorityScore} size="md" />
              <div>
                <div className="text-sm font-bold text-white">{higherIncident.type}</div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Target asset: <span className="text-slate-200">{higherIncident.asset}</span>
                </div>
                <div className="text-[11px] text-cyan-400 font-mono mt-0.5">
                  Source IP: {higherIncident.sourceIp}
                </div>
              </div>
            </div>
          </div>

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
                <div className="text-xs text-slate-400 mt-0.5">
                  Target asset: <span className="text-slate-300">{lowerIncident.asset}</span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Source IP: {lowerIncident.sourceIp}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/45 p-4">
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
            Technical explanation
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{narrative}</p>
        </div>

        <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h4 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                Full factor-by-factor breakdown
              </h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Shows exactly where the two incidents gained or lost priority points.</p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">
              Final gap: +{overallScoreDiff.toFixed(1)} pts
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/50 text-[11px] text-slate-400 uppercase">
                  <th className="py-2.5 px-4">Factor</th>
                  <th className="py-2.5 px-3 text-cyan-300">#{higherIncident.rank} score</th>
                  <th className="py-2.5 px-3 text-slate-400">#{lowerIncident.rank} score</th>
                  <th className="py-2.5 px-3 text-right">Priority points gained</th>
                  <th className="py-2.5 px-4">What this means</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {deltas.map((delta) => {
                  const isAdvantage = delta.pointDiff > 0;
                  const isDeficit = delta.pointDiff < 0;

                  return (
                    <tr key={delta.factorKey} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-4 font-semibold text-slate-200">{delta.factor}</td>
                      <td className="py-2.5 px-3 text-white font-bold">{delta.incidentAValue}/10</td>
                      <td className="py-2.5 px-3 text-slate-400">{delta.incidentBValue}/10</td>
                      <td className="py-2.5 px-3 text-right font-bold">
                        {isAdvantage ? (
                          <span className="text-cyan-400">+{delta.pointDiff.toFixed(1)}</span>
                        ) : isDeficit ? (
                          <span className="text-red-400">{delta.pointDiff.toFixed(1)}</span>
                        ) : (
                          <span className="text-slate-500">0.0</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-[11px] text-slate-300 font-sans">{delta.explanation}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

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

import React from 'react';
import { FactorContribution } from '../../types/incident';

export const FactorBreakdownBar: React.FC<{ contribution: FactorContribution }> = ({
  contribution,
}) => {
  const { name, value, weight, contribution: pts, percentage } = contribution;

  // Max score for any factor is 10 * weight * 10 = weight * 100
  const maxPossible = weight * 100;
  const fillPercent = (pts / maxPossible) * 100;

  const colorClasses = {
    severity: 'from-red-600 to-rose-500',
    businessImpact: 'from-orange-600 to-amber-500',
    assetImportance: 'from-purple-600 to-indigo-500',
    dataSensitivity: 'from-pink-600 to-rose-500',
    attackConfidence: 'from-cyan-600 to-blue-500',
    affectedUsers: 'from-emerald-600 to-teal-500',
    correlationScore: 'from-violet-600 to-purple-500',
  };

  const gradient = colorClasses[contribution.factor] || 'from-cyan-600 to-blue-500';

  return (
    <div className="space-y-1.5 p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80">
      <div className="flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-200">{name}</span>
          <span className="text-[10px] text-slate-500">
            ({(weight * 100).toFixed(0)}% weight)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Score: {value}/10</span>
          <span className="font-bold text-cyan-300 font-mono">
            +{pts.toFixed(1)} pts
          </span>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden relative">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(100, Math.max(5, fillPercent))}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span>Contributes {percentage}% of total score</span>
        <span>Max potential: +{maxPossible.toFixed(1)} pts</span>
      </div>
    </div>
  );
};

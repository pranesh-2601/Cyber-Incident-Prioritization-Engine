import React from 'react';
import { Sliders, RotateCcw, ArrowRight, Scale } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';
import { DEFAULT_WEIGHTS, FACTOR_LABELS } from '../../utils/scoringEngine';
import { FactorWeights } from '../../types/incident';

export const WeightCustomizer: React.FC<{
  onNavigateToQueue: () => void;
}> = ({ onNavigateToQueue }) => {
  const { weights, updateWeights, resetWeights } = useIncidents();

  const handleSliderChange = (key: keyof FactorWeights, percentValue: number) => {
    updateWeights({ [key]: percentValue / 100 });
  };

  const totalWeightPercent = Math.round(
    Object.values(weights).reduce((a, b) => a + b, 0) * 100
  );

  const keys: (keyof FactorWeights)[] = [
    'severity',
    'businessImpact',
    'assetImportance',
    'dataSensitivity',
    'attackConfidence',
    'affectedUsers',
    'correlationScore',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-5 h-5 text-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Mathematical Scoring Weights Calibration
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-1 max-w-2xl">
              Calibrate the algorithmic formula. When you adjust any slider, the system <span className="text-cyan-400 font-mono font-bold">dynamically re-calculates all priority scores</span> and instantly re-ranks every incident in memory.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={resetWeights}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>

            <button
              onClick={onNavigateToQueue}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold shadow-md shadow-cyan-600/30 transition-colors"
            >
              <span>View Re-Ranked Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Total Configured Weight:</span>
            <span
              className={`font-bold ${
                totalWeightPercent === 100 ? 'text-emerald-400' : 'text-yellow-400'
              }`}
            >
              {totalWeightPercent}%
            </span>
          </div>
          <span className="text-slate-500">
            Formula: Score = Σ(Factor × Normalized Weight) × 10
          </span>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
          Individual Factor Calibrations (Official Hackathon Spec)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {keys.map((key) => {
            const currentVal = Math.round(weights[key] * 100);
            const defaultVal = Math.round(DEFAULT_WEIGHTS[key] * 100);
            const label = FACTOR_LABELS[key];

            return (
              <div
                key={key}
                className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <div>
                    <span className="font-bold text-white">{label.name}</span>
                    <span className="text-[10px] text-slate-500 ml-1.5">
                      (Default: {defaultVal}%)
                    </span>
                  </div>
                  <span className="text-cyan-400 font-extrabold text-sm">
                    {currentVal}%
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="40"
                  step="1"
                  value={currentVal}
                  onChange={(e) => handleSliderChange(key, parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />

                <p className="text-[11px] text-slate-400 font-sans leading-snug">
                  {label.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
            Deterministic Tie-Breaking Policy
          </h3>
        </div>

        <p className="text-xs text-slate-300 font-sans leading-relaxed">
          When multiple security alerts produce identical priority scores, the prioritization engine uses the following strict 4-stage tie-breaker hierarchy:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-900 border border-purple-500/40 text-purple-300">
            <div className="text-[10px] text-slate-500 uppercase">1st Precedence</div>
            <div className="font-bold mt-0.5">Correlation Score</div>
            <div className="text-[10px] text-slate-400 mt-1">Multi-stage threats prioritized</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-red-500/40 text-red-300">
            <div className="text-[10px] text-slate-500 uppercase">2nd Precedence</div>
            <div className="font-bold mt-0.5">Exploit Severity</div>
            <div className="text-[10px] text-slate-400 mt-1">Highest CVSS / weaponization</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300">
            <div className="text-[10px] text-slate-500 uppercase">3rd Precedence</div>
            <div className="font-bold mt-0.5">Asset Importance</div>
            <div className="text-[10px] text-slate-400 mt-1">Crown Jewels & Domain Controllers</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-blue-500/40 text-blue-300">
            <div className="text-[10px] text-slate-500 uppercase">4th Precedence</div>
            <div className="font-bold mt-0.5">Recency (Timestamp)</div>
            <div className="text-[10px] text-slate-400 mt-1">Most recent active intrusion</div>
          </div>
        </div>
      </div>
    </div>
  );
};

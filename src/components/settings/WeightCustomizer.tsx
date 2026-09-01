import React from 'react';
import { Sliders, RotateCcw, ArrowRight, Scale } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';
import { DEFAULT_WEIGHTS, FACTOR_LABELS } from '../../utils/scoringEngine';
import { FactorWeights } from '../../types/incident';

const simpleMeaning: Record<keyof FactorWeights, string> = {
  severity: 'How dangerous the attack itself is',
  businessImpact: 'How badly business work could be affected',
  assetImportance: 'How important the targeted system is',
  dataSensitivity: 'How sensitive the involved data is',
  attackConfidence: 'How sure we are this is a real attack',
  affectedUsers: 'How many people could be affected',
  correlationScore: 'How strongly this alert connects to other suspicious activity',
};

export const WeightCustomizer: React.FC<{ onNavigateToQueue: () => void }> = ({ onNavigateToQueue }) => {
  const { weights, updateWeights, resetWeights } = useIncidents();

  const handleSliderChange = (key: keyof FactorWeights, percentValue: number) => {
    updateWeights({ [key]: percentValue / 100 });
  };

  const totalWeightPercent = Math.round(Object.values(weights).reduce((a, b) => a + b, 0) * 100);

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
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Scoring Weights — how much each factor matters</h2>
            </div>
            <p className="text-xs text-slate-300 mt-2 max-w-2xl leading-relaxed">
              A higher percentage means that factor has more influence on the final priority score. Change any slider and the system immediately recalculates and re-ranks every incident.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={resetWeights} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"><RotateCcw className="w-3.5 h-3.5" /><span>Reset Defaults</span></button>
            <button onClick={onNavigateToQueue} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold shadow-md shadow-cyan-600/30 transition-colors"><span>See Updated Ranking</span><ArrowRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-800 text-xs font-mono">
          <div className="flex items-center gap-2"><span className="text-slate-400">Total configured weight:</span><span className={`font-bold ${totalWeightPercent === 100 ? 'text-emerald-400' : 'text-yellow-400'}`}>{totalWeightPercent}%</span></div>
          <span className="text-slate-500">Technical formula: Σ(Factor × Normalized Weight) × 10</span>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <div>
          <h3 className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">7 factors used to calculate priority</h3>
          <p className="text-[11px] text-slate-500 mt-1">Move a slider right to make that factor more important in the final ranking.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {keys.map((key) => {
            const currentVal = Math.round(weights[key] * 100);
            const defaultVal = Math.round(DEFAULT_WEIGHTS[key] * 100);
            const label = FACTOR_LABELS[key];

            return (
              <div key={key} className="p-4 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div><span className="font-bold text-white">{label.name}</span><span className="text-[10px] text-slate-500 ml-1.5">Default {defaultVal}%</span></div>
                  <span className="text-cyan-400 font-extrabold text-sm">{currentVal}%</span>
                </div>
                <p className="text-[11px] text-slate-300">{simpleMeaning[key]}</p>
                <input type="range" min="0" max="40" step="1" value={currentVal} onChange={(e) => handleSliderChange(key, parseInt(e.target.value, 10))} className="w-full accent-cyan-500 cursor-pointer" />
                <p className="text-[10px] text-slate-500 leading-snug">Technical note: {label.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center gap-2"><Scale className="w-4 h-4 text-cyan-400" /><h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">What if two incidents get the same score?</h3></div>
        <p className="text-xs text-slate-300 leading-relaxed">The engine needs a consistent way to choose which one comes first. It checks these tie-breakers in order:</p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-purple-500/40 text-purple-300"><div className="text-[10px] text-slate-500 uppercase">1st</div><div className="font-bold mt-0.5">Correlation Score</div><div className="text-[10px] text-slate-400 mt-1">Prefer alerts connected to a bigger attack</div></div>
          <div className="p-3 rounded-lg bg-slate-900 border border-red-500/40 text-red-300"><div className="text-[10px] text-slate-500 uppercase">2nd</div><div className="font-bold mt-0.5">Severity</div><div className="text-[10px] text-slate-400 mt-1">Prefer the more dangerous attack</div></div>
          <div className="p-3 rounded-lg bg-slate-900 border border-amber-500/40 text-amber-300"><div className="text-[10px] text-slate-500 uppercase">3rd</div><div className="font-bold mt-0.5">Asset Importance</div><div className="text-[10px] text-slate-400 mt-1">Prefer the more important targeted system</div></div>
          <div className="p-3 rounded-lg bg-slate-900 border border-blue-500/40 text-blue-300"><div className="text-[10px] text-slate-500 uppercase">4th</div><div className="font-bold mt-0.5">Recency</div><div className="text-[10px] text-slate-400 mt-1">Prefer the most recent active incident</div></div>
        </div>
      </div>
    </div>
  );
};

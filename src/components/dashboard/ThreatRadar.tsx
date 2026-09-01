import React from 'react';
import { 
  Radar, 
  ShieldAlert, 
  Network, 
  ArrowRight, 
  ChevronRight, 
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';
import { RiskBadge, StatusBadge } from '../common/Badge';
import { ScoreGauge } from '../common/ScoreGauge';
import { Incident, AttackChain } from '../../types/incident';

export const ThreatRadar: React.FC<{
  onSelectIncident: (inc: Incident) => void;
  onSelectChain: (chain: AttackChain) => void;
  onNavigateToQueue: () => void;
  onNavigateToChains: () => void;
}> = ({ onSelectIncident, onSelectChain, onNavigateToQueue, onNavigateToChains }) => {
  const { incidents, attackChains } = useIncidents();

  const topCritical = incidents.slice(0, 4);
  const activeChains = attackChains.slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Top Prioritized Threats (Top 4) */}
      <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Top Priority Threat Focus
              </h2>
            </div>
            <button
              onClick={onNavigateToQueue}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>View Full Ranked Queue ({incidents.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Incident Focus List */}
          <div className="space-y-2.5">
            {topCritical.map((inc) => (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc)}
                className="group p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/50 hover:bg-slate-800/80 transition-all cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Rank badge */}
                  <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center font-mono font-extrabold text-sm text-cyan-300 shrink-0 group-hover:border-cyan-500">
                    #{inc.rank}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-white truncate group-hover:text-cyan-300">
                        {inc.id} • {inc.type}
                      </span>
                      <RiskBadge level={inc.riskLevel} size="sm" />
                      {inc.correlatedIncidentIds.length > 0 && (
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                          <Network className="w-2.5 h-2.5" />
                          {inc.correlatedIncidentIds.length} Linked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      Target: <span className="text-slate-200">{inc.asset}</span> • Attacker IP: <span className="font-mono text-cyan-400">{inc.sourceIp}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-mono font-extrabold text-white">
                      {inc.priorityScore}/100
                    </div>
                    <div className="text-[10px] font-mono text-slate-500">
                      Weighted Score
                    </div>
                  </div>
                  <ScoreGauge score={inc.priorityScore} size="sm" showLabel={false} />
                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explainability Callout footer */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Click any incident to inspect 7-factor mathematical score attribution</span>
          </div>
          <span className="hidden sm:inline text-slate-500">Auto-sorted by Deterministic Priority</span>
        </div>
      </div>

      {/* Right Column: Active Attack Chains preview */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
            <div className="flex items-center gap-2">
              <Network className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Active Attack Chains
              </h2>
            </div>
            <button
              onClick={onNavigateToChains}
              className="text-xs font-mono text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              <span>Graph View</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeChains.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs font-mono">
              No active correlated chains detected. Ingest or simulate alerts.
            </div>
          ) : (
            <div className="space-y-3">
              {activeChains.map((chain) => (
                <div
                  key={chain.id}
                  onClick={() => onSelectChain(chain)}
                  className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/60 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 font-bold">
                      {chain.nodes.length} Stages Linked
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">
                      {chain.confidence}% Confidence
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-white group-hover:text-purple-300 transition-colors truncate">
                    {chain.name}
                  </div>

                  {/* Micro Kill Chain Nodes */}
                  <div className="flex items-center gap-1 mt-2.5 overflow-x-auto pb-1">
                    {chain.nodes.map((node, i) => (
                      <React.Fragment key={node.id}>
                        <span className="px-1.5 py-0.5 rounded bg-slate-950 text-[9px] font-mono text-slate-300 border border-slate-700 whitespace-nowrap">
                          {node.type.split(' ')[0]}
                        </span>
                        {i < chain.nodes.length - 1 && (
                          <span className="text-slate-600 text-[10px]">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Target Entities: {attackChains.reduce((acc, c) => acc + c.entities.assets.length, 0)} Hosts</span>
          <span className="text-purple-400 font-bold">{attackChains.length} Total Clusters</span>
        </div>
      </div>
    </div>
  );
};

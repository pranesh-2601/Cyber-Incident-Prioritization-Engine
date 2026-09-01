import React, { useState } from 'react';
import { 
  Network, 
  ShieldAlert, 
  ArrowRight, 
  User, 
  Server, 
  Clock, 
  Sparkles, 
  Layers, 
  Zap,
  CheckCircle2,
  Lock,
  ChevronRight
} from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';
import { AttackChain, AttackChainNode, Incident } from '../../types/incident';
import { ChainNodeDetailModal } from './ChainNodeDetailModal';
import { RiskBadge } from '../common/Badge';
import { ScoreGauge } from '../common/ScoreGauge';

export const AttackChainVisualizer: React.FC<{
  onSelectIncident: (inc: Incident) => void;
}> = ({ onSelectIncident }) => {
  const { attackChains, incidents } = useIncidents();
  const [selectedChainId, setSelectedChainId] = useState<string>(
    attackChains[0]?.id || ''
  );
  const [activeNode, setActiveNode] = useState<AttackChainNode | null>(null);

  const activeChain = attackChains.find((c) => c.id === selectedChainId) || attackChains[0];

  const stageIcons: Record<string, string> = {
    'Initial Access': '🚪',
    'Execution': '⚡',
    'Credential Access': '🔑',
    'Privilege Escalation': '👑',
    'Lateral Movement': '↔️',
    'Exfiltration': '📤',
    'Impact': '💥',
  };

  const stageColors: Record<string, string> = {
    'Initial Access': 'border-blue-500/50 bg-blue-950/40 text-blue-300',
    'Execution': 'border-amber-500/50 bg-amber-950/40 text-amber-300',
    'Credential Access': 'border-orange-500/50 bg-orange-950/40 text-orange-300',
    'Privilege Escalation': 'border-purple-500/50 bg-purple-950/40 text-purple-300',
    'Lateral Movement': 'border-indigo-500/50 bg-indigo-950/40 text-indigo-300',
    'Exfiltration': 'border-red-500/50 bg-red-950/40 text-red-300',
    'Impact': 'border-rose-500/50 bg-rose-950/40 text-rose-300',
  };

  return (
    <div className="space-y-6">
      {/* Chain Selector Strip */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-purple-400" />
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              Discovered Multi-Vector Attack Chains ({attackChains.length})
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Autonomous Graph Correlation Active
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {attackChains.map((chain) => {
            const isSelected = activeChain?.id === chain.id;
            return (
              <button
                key={chain.id}
                onClick={() => setSelectedChainId(chain.id)}
                className={`p-3 rounded-lg text-left border transition-all ${
                  isSelected
                    ? 'bg-purple-950/70 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                    : 'bg-slate-900/60 border-slate-800 hover:border-purple-500/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-purple-300 px-1.5 py-0.5 rounded bg-purple-900/50 border border-purple-500/30">
                    {chain.nodes.length} Stages
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    {chain.confidence}% Match
                  </span>
                </div>
                <div className="text-xs font-bold text-white truncate mt-1">
                  {chain.name}
                </div>
                <div className="text-[10px] font-mono text-slate-400 truncate mt-1">
                  Primary Attacker: {chain.entities.sourceIps[0] || 'Unknown'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Chain Graph Canvas */}
      {activeChain ? (
        <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-6">
          {/* Chain Meta Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b border-slate-800/80 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 font-bold">
                  {activeChain.id}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/40 font-bold">
                  STATUS: {activeChain.status}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white">{activeChain.name}</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Threat Actor Profile: <span className="text-slate-200">{activeChain.threatActor}</span> • Confidence: <span className="text-emerald-400 font-bold">{activeChain.confidence}%</span>
              </p>
            </div>

            {/* Entity Summary Tags */}
            <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
              <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                <Server className="w-3 h-3 text-cyan-400" />
                <span>{activeChain.entities.assets.length} Target Hosts</span>
              </div>
              <div className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                <User className="w-3 h-3 text-amber-400" />
                <span>{activeChain.entities.users.length} Compromised Accounts</span>
              </div>
            </div>
          </div>

          {/* Sequential Graph Flow (Horizontal Progression) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sequential MITRE Kill Chain Progression (Click any node for telemetry details)</span>
              </span>
              <span>Progression Order: Left → Right</span>
            </div>

            {/* Nodes Container */}
            <div className="relative overflow-x-auto py-6 px-2">
              <div className="flex items-center gap-6 min-w-max">
                {activeChain.nodes.map((node, index) => {
                  const stageColor = stageColors[node.stage] || 'border-slate-700 bg-slate-900 text-slate-300';
                  const isLast = index === activeChain.nodes.length - 1;

                  return (
                    <React.Fragment key={node.id}>
                      {/* Node Card */}
                      <div
                        onClick={() => setActiveNode(node)}
                        className={`group relative w-64 p-4 rounded-xl border ${stageColor} backdrop-blur-md cursor-pointer hover:scale-105 transition-all shadow-lg hover:shadow-cyan-950/40`}
                      >
                        {/* Stage Badge & Icon */}
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-950/80 border border-current">
                            {stageIcons[node.stage]} {node.stage}
                          </span>
                          <span className="text-xs font-mono font-bold text-white">
                            {node.priorityScore}/100
                          </span>
                        </div>

                        {/* Incident Type */}
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                          {node.type}
                        </div>

                        {/* MITRE code */}
                        {node.mitreTechnique && (
                          <div className="text-[10px] font-mono text-cyan-400 mt-1 truncate">
                            {node.mitreTechnique}
                          </div>
                        )}

                        {/* Asset & IP */}
                        <div className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono space-y-0.5 text-slate-400">
                          <div className="truncate">Host: <span className="text-slate-200">{node.asset}</span></div>
                          <div className="truncate">Attacker: <span className="text-cyan-300">{node.sourceIp}</span></div>
                          <div className="truncate">Account: <span className="text-amber-300">{node.user}</span></div>
                        </div>

                        <div className="mt-2 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                          <span>{node.incidentId}</span>
                          <span className="text-cyan-400 group-hover:underline">Inspect Node →</span>
                        </div>
                      </div>

                      {/* Animated Connector Arrow */}
                      {!isLast && (
                        <div className="flex flex-col items-center justify-center text-purple-400">
                          <div className="w-8 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 relative">
                            <span className="absolute -top-1.5 right-0 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                          </div>
                          <ArrowRight className="w-4 h-4 mt-1 text-cyan-400" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chain Blast Radius & Recommended SOC Strategy */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-purple-500/30 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <div className="text-purple-300 font-bold uppercase mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Coordinated Campaign Containment Playbook</span>
              </div>
              <p className="text-slate-300 leading-relaxed font-sans text-xs">
                This attack chain connects initial access with internal privilege escalation. Recommended strategy is to simultaneously sever external C2 channel ({activeChain.entities.sourceIps[0]}) while invalidating Kerberos tickets for {activeChain.entities.users.join(', ')}.
              </p>
            </div>

            <div className="space-y-1">
              <div className="text-slate-400 uppercase">Impacted Target Subnets</div>
              <div className="text-white font-bold">{activeChain.entities.assets.join(' • ')}</div>
              <div className="text-[11px] text-slate-400 pt-1">
                Root Incident: <span className="text-cyan-300 font-bold">{activeChain.rootIncidentId}</span> → Terminal Incident: <span className="text-red-400 font-bold">{activeChain.latestIncidentId}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 text-center text-slate-400 font-mono text-xs">
          No correlated attack chains found. Ingest alerts to auto-generate graphs.
        </div>
      )}

      {/* Node Detail Modal */}
      <ChainNodeDetailModal
        node={activeNode}
        onClose={() => setActiveNode(null)}
        onOpenFullIncident={onSelectIncident}
      />
    </div>
  );
};

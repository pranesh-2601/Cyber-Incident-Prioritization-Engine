import React from 'react';
import { Activity, ArrowRight, Bot, Crosshair, Network, ShieldAlert, Sparkles, Target, Zap } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';
import { Incident, AttackChain } from '../../types/incident';
import { RiskBadge } from '../common/Badge';
import { ScoreGauge } from '../common/ScoreGauge';

const factorLabel: Record<keyof Incident['factors'], string> = {
  severity: 'Severity',
  businessImpact: 'Business Impact',
  assetImportance: 'Asset Importance',
  dataSensitivity: 'Data Sensitivity',
  attackConfidence: 'Attack Confidence',
  affectedUsers: 'Affected Users',
  correlationScore: 'Correlation Strength',
};

export const MissionControlDeck: React.FC<{
  onSelectIncident: (incident: Incident) => void;
  onSelectChain: (chain: AttackChain) => void;
  onNavigateToQueue: () => void;
  onNavigateToChains: () => void;
}> = ({ onSelectIncident, onSelectChain, onNavigateToQueue, onNavigateToChains }) => {
  const { incidents, attackChains, metrics, weights } = useIncidents();
  const top = incidents[0];
  const next = incidents[1];
  const hotThreats = incidents.slice(0, 4);
  const chains = attackChains.slice(0, 3);

  const delta = top && next ? Math.max(0, Math.round((top.priorityScore - next.priorityScore) * 10) / 10) : 0;

  const strongestReasons = top
    ? (Object.keys(top.factors) as (keyof Incident['factors'])[])
        .map((key) => ({
          key,
          label: factorLabel[key],
          value: top.factors[key],
          contribution: top.factors[key] * weights[key],
        }))
        .sort((a, b) => b.contribution - a.contribution)
        .slice(0, 3)
    : [];

  const plainLanguageReason = top && next
    ? `${top.type} is ranked first because it creates more overall risk than ${next.type}. Its final priority score is ${top.priorityScore}, which is ${delta} points higher than #2. The biggest reasons are ${strongestReasons.map((r) => `${r.label.toLowerCase()} (${r.value}/10)`).join(', ')}.`
    : 'Waiting for at least two incidents so the system can explain the ranking in plain language.';

  return (
    <div className="mission-grid">
      <section className="mission-panel mission-panel-left">
        <div className="mission-panel-heading">
          <div className="flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-300" />
            <span>Threat Focus Radar</span>
          </div>
          <span className="mission-live-pill"><span className="mission-live-dot" />LIVE</span>
        </div>

        <div className="mission-radar-wrap">
          <div className="mission-radar">
            <span className="mission-radar-ring mission-radar-ring-1" />
            <span className="mission-radar-ring mission-radar-ring-2" />
            <span className="mission-radar-ring mission-radar-ring-3" />
            <span className="mission-radar-cross mission-radar-cross-x" />
            <span className="mission-radar-cross mission-radar-cross-y" />
            <span className="mission-radar-sweep" />
            {hotThreats.map((incident, index) => (
              <button
                key={incident.id}
                onClick={() => onSelectIncident(incident)}
                className={`mission-blip mission-blip-${index + 1}`}
                title={`${incident.id} ${incident.type}`}
              />
            ))}
            <div className="mission-radar-core">
              <Target className="w-5 h-5 text-cyan-300" />
            </div>
          </div>
          <div className="mission-radar-meta">
            <div><span>HOT ZONES</span><strong>{metrics.criticalCount + metrics.highCount}</strong></div>
            <div><span>CHAIN LINKS</span><strong>{attackChains.length}</strong></div>
            <div><span>ASSETS</span><strong>{metrics.affectedAssetsCount}</strong></div>
          </div>
        </div>

        <div className="space-y-2.5 mt-4">
          {hotThreats.map((incident) => (
            <button key={incident.id} onClick={() => onSelectIncident(incident)} className="mission-threat-row">
              <div className="mission-rank">#{incident.rank}</div>
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-2">
                  <span className="truncate text-xs font-bold text-slate-100">{incident.type}</span>
                  <RiskBadge level={incident.riskLevel} size="sm" />
                </div>
                <div className="truncate text-[10px] font-mono text-slate-500 mt-1">{incident.asset} • {incident.sourceIp}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-black font-mono text-cyan-200">{incident.priorityScore}</div>
                <div className="text-[9px] text-slate-600 font-mono">SCORE</div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mission-panel mission-panel-center">
        <div className="mission-panel-heading">
          <div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-300" /><span>Priority Command Queue</span></div>
          <button onClick={onNavigateToQueue} className="mission-link">FULL QUEUE <ArrowRight className="w-3 h-3" /></button>
        </div>

        {top ? (
          <div className="mission-primary-threat">
            <div className="mission-primary-head">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="mission-priority-chip">PRIORITY #1</span>
                  <RiskBadge level={top.riskLevel} size="sm" />
                  {top.correlatedIncidentIds.length > 0 && <span className="mission-chain-chip"><Network className="w-3 h-3" />{top.correlatedIncidentIds.length} LINKS</span>}
                </div>
                <h2 className="text-xl lg:text-2xl font-black tracking-tight text-white">{top.type}</h2>
                <p className="text-xs text-slate-400 mt-1">{top.title}</p>
              </div>
              <ScoreGauge score={top.priorityScore} size="lg" />
            </div>

            <div className="mission-primary-grid">
              <div><span>TARGET ASSET</span><strong>{top.asset}</strong></div>
              <div><span>SOURCE</span><strong>{top.sourceIp}</strong></div>
              <div><span>IDENTITY</span><strong>{top.user}</strong></div>
              <div><span>STATUS</span><strong>{top.status}</strong></div>
            </div>

            <button onClick={() => onSelectIncident(top)} className="mission-investigate-btn">
              <Zap className="w-4 h-4" /> OPEN INCIDENT DOSSIER <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : null}

        <div className="mission-center-strip">
          {incidents.slice(1, 4).map((incident) => (
            <button key={incident.id} onClick={() => onSelectIncident(incident)} className="mission-mini-card">
              <span className="mission-mini-rank">#{incident.rank}</span>
              <span className="truncate text-[11px] text-slate-300 flex-1 text-left">{incident.type}</span>
              <strong className="text-xs font-mono text-slate-100">{incident.priorityScore}</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="mission-panel mission-panel-right">
        <div className="mission-panel-heading">
          <div className="flex items-center gap-2"><Bot className="w-4 h-4 text-violet-300" /><span>AI Ranking Explanation</span></div>
          <span className="text-[9px] font-mono text-violet-300">PLAIN LANGUAGE</span>
        </div>

        <div className="mission-ai-card">
          <div className="mission-ai-icon"><Sparkles className="w-5 h-5" /></div>
          <div>
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-violet-300">Why is this incident #1?</div>
            <p className="text-xs leading-relaxed text-slate-300 mt-2">{plainLanguageReason}</p>
          </div>
        </div>

        {top && next && (
          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/55 p-3">
            <div className="text-[10px] font-mono text-slate-500 uppercase mb-2">Simple comparison</div>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
              <div>
                <div className="text-[10px] text-cyan-300 font-mono">#1 {top.type}</div>
                <div className="text-xl font-black text-white font-mono">{top.priorityScore}</div>
              </div>
              <div className="text-xs font-black text-emerald-300">+{delta}</div>
              <div className="text-right">
                <div className="text-[10px] text-slate-500 font-mono">#2 {next.type}</div>
                <div className="text-xl font-black text-slate-300 font-mono">{next.priorityScore}</div>
              </div>
            </div>
          </div>
        )}

        {top && (
          <div className="space-y-2.5 mt-4">
            <div className="text-[10px] font-mono uppercase text-slate-500">Top 3 reasons</div>
            {strongestReasons.map((reason, index) => (
              <div key={reason.key} className="rounded-lg border border-slate-800 bg-slate-950/45 px-3 py-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300"><strong className="text-violet-300 mr-1">{index + 1}.</strong>{reason.label}</span>
                  <span className="font-mono font-bold text-white">{reason.value}/10</span>
                </div>
                <div className="mission-meter mt-2"><span style={{ width: `${reason.value * 10}%` }} /></div>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => top && onSelectIncident(top)} className="mission-ai-action" disabled={!top}>SEE FULL SCORE BREAKDOWN</button>
      </section>

      <section className="mission-panel mission-chain-panel">
        <div className="mission-panel-heading">
          <div className="flex items-center gap-2"><Activity className="w-4 h-4 text-violet-300" /><span>Attack Chain Timeline</span></div>
          <button onClick={onNavigateToChains} className="mission-link">GRAPH VIEW <ArrowRight className="w-3 h-3" /></button>
        </div>
        {chains.length > 0 ? (
          <div className="mission-chain-list">
            {chains.map((chain) => (
              <button key={chain.id} onClick={() => onSelectChain(chain)} className="mission-chain-row">
                <div className="mission-chain-node"><Network className="w-3.5 h-3.5" /></div>
                <div className="min-w-0 flex-1 text-left">
                  <div className="text-[11px] font-bold text-slate-200 truncate">{chain.name}</div>
                  <div className="flex items-center gap-1 mt-2 overflow-hidden">
                    {chain.nodes.slice(0, 5).map((node, index) => (
                      <React.Fragment key={node.id}>
                        <span className="mission-stage-chip">{node.stage}</span>
                        {index < Math.min(chain.nodes.length, 5) - 1 && <span className="text-slate-700">→</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
                <div className="text-right"><div className="text-xs font-black font-mono text-violet-300">{chain.confidence}%</div><div className="text-[9px] font-mono text-slate-600">CONFIDENCE</div></div>
              </button>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs font-mono text-slate-600">No correlated attack chains detected.</div>
        )}
      </section>
    </div>
  );
};

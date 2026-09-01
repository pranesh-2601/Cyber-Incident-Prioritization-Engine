import React from 'react';
import {
  Play,
  Pause,
  Flame,
  Activity,
  Zap,
  Database,
} from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';

export const SimulationController: React.FC<{
  onNavigateToQueue: () => void;
}> = ({ onNavigateToQueue }) => {
  const {
    isLiveMode,
    setIsLiveMode,
    simulateBatchAlerts,
    incidents,
    metrics,
  } = useIncidents();

  const scenarios = [
    {
      title: 'Enterprise Shift Simulation (25+ Multi-Vector Alerts)',
      desc: 'Generates a realistic enterprise shift alert pool with correlated IP clusters, Active Directory takeovers, and noise filters.',
      tag: 'RECOMMENDED',
      tagColor: 'bg-cyan-950 text-cyan-400 border-cyan-500/40',
    },
    {
      title: 'APT29 State-Sponsored Cyber Espionage',
      desc: 'Injects a multi-stage sequence including spearphishing, suspicious PowerShell, privilege activity, and data exfiltration signals.',
      tag: 'APT CAMPAIGN',
      tagColor: 'bg-red-950 text-red-400 border-red-500/40',
    },
    {
      title: 'Ransomware Rapid Encryption Scenario',
      desc: 'Injects a fast-moving ransomware-style alert set so the prioritization engine can rank critical systems and correlated activity.',
      tag: 'RANSOMWARE',
      tagColor: 'bg-purple-950 text-purple-400 border-purple-500/40',
    },
  ];

  const injectScenario = () => {
    simulateBatchAlerts();
    onNavigateToQueue();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div
        className={`glass-panel p-6 rounded-xl border transition-all ${
          isLiveMode
            ? 'border-red-500/60 bg-gradient-to-r from-red-950/30 via-slate-900 to-red-950/30 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
            : 'border-slate-800'
        }`}
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${isLiveMode ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`} />
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                Real-Time SOC Alert Ingestion
              </h2>
            </div>
            <p className="text-xs text-slate-300 font-sans max-w-xl">
              Generates realistic security events every 6 seconds. Each new alert is scored, correlated, and inserted into the shared priority queue so the ranking can change in real time.
            </p>
          </div>

          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`px-6 py-3 rounded-xl font-mono font-bold text-xs tracking-wider uppercase flex items-center gap-2 shadow-lg transition-all ${
              isLiveMode
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40 animate-pulse'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
            }`}
          >
            {isLiveMode ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Live Stream</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Start Live Stream</span>
              </>
            )}
          </button>
        </div>

        {isLiveMode && (
          <div className="mt-4 pt-4 border-t border-red-900/40 flex items-center justify-between text-xs font-mono text-red-300">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-400 animate-spin" />
              <span>Streaming Event Rate: {metrics.eventsPerSecond} EPS • Auto Re-ranking Active</span>
            </div>
            <span className="text-slate-400">Total Shared Alerts: {incidents.length}</span>
          </div>
        )}
      </div>

      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              Batch Alert Ingestion Scenarios
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Test how mixed alerts are prioritized
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {scenarios.map((scenario) => (
            <div
              key={scenario.title}
              className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 flex flex-col justify-between space-y-3 group"
            >
              <div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border inline-block mb-2 font-bold ${scenario.tagColor}`}>
                  {scenario.tag}
                </span>
                <h4 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {scenario.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 font-sans leading-snug">
                  {scenario.desc}
                </p>
              </div>

              <button
                onClick={injectScenario}
                className="w-full py-2 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Inject Scenario</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel p-5 rounded-xl border border-slate-800 flex items-start gap-3 text-xs">
        <Database className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-white font-bold font-mono">Shared demo data is persistent</div>
          <div className="text-slate-500 text-[11px] mt-1 leading-relaxed">
            There is no destructive “Reset All Data” button in shared mode. Incidents are stored in Supabase and synchronized across browsers, so one analyst cannot accidentally wipe the team queue during a demo.
          </div>
        </div>
      </div>
    </div>
  );
};

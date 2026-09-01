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
import { generateBatchAlerts, INITIAL_MOCK_INCIDENTS } from '../../utils/mockData';

export const SimulationController: React.FC<{
  onNavigateToQueue: () => void;
}> = ({ onNavigateToQueue }) => {
  const {
    isLiveMode,
    setIsLiveMode,
    addIncident,
    incidents,
    metrics,
  } = useIncidents();

  const injectScenario = () => {
    const initialIds = new Set(INITIAL_MOCK_INCIDENTS.map((incident) => incident.id));
    const freshTemplates = generateBatchAlerts().filter((incident) => !initialIds.has(incident.id));

    freshTemplates.forEach((incident, index) => {
      const {
        id: _id,
        weightedScore: _weightedScore,
        priorityScore: _priorityScore,
        riskLevel: _riskLevel,
        rank: _rank,
        correlatedIncidentIds: _correlatedIncidentIds,
        ...incidentData
      } = incident;

      addIncident({
        ...incidentData,
        timestamp: new Date(Date.now() - index * 1000).toISOString(),
        isNewAlert: true,
      });
    });

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
              Batch Alert Simulation
            </h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Test how a fresh mixed batch is prioritized
          </span>
        </div>

        <div className="max-w-2xl">
          <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 space-y-4 group">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded border inline-block mb-2 font-bold bg-cyan-950 text-cyan-400 border-cyan-500/40">
                FRESH BATCH
              </span>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                Enterprise Multi-Vector Alert Simulation
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 font-sans leading-relaxed">
                Injects 18 brand-new mixed security alerts with fresh incident IDs. Existing incidents are not duplicated, so Supabase realtime refresh will not make rows suddenly disappear or change because of ID collisions.
              </p>
            </div>

            <button
              onClick={injectScenario}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-xs font-mono font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inject 18 Fresh Alerts</span>
            </button>
          </div>
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

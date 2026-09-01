import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Download,
  Flame,
  Search,
  Database,
} from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';
import { loadIncidentsFromSupabase } from '../../services/supabaseIncidents';
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

type DatabaseStatus = 'syncing' | 'connected' | 'offline';

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const {
    isLiveMode,
    setIsLiveMode,
    simulateBatchAlerts,
    exportDataJSON,
    filters,
    setFilters,
  } = useIncidents();
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus>('syncing');

  useEffect(() => {
    let cancelled = false;

    const checkDatabase = async () => {
      if (!cancelled) setDatabaseStatus('syncing');
      try {
        await loadIncidentsFromSupabase();
        if (!cancelled) setDatabaseStatus('connected');
      } catch {
        if (!cancelled) setDatabaseStatus('offline');
      }
    };

    void checkDatabase();
    const interval = window.setInterval(() => void checkDatabase(), 10000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const titles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'SOC Overview & Command Radar', subtitle: 'Live telemetry, attack chain health, and prioritized alert statistics' },
    queue: { title: 'Prioritized Incident Queue', subtitle: 'Dynamically sorted security incidents ranked by normalized multi-factor threat score' },
    chains: { title: 'Correlated Attack Chains', subtitle: 'Graph visualization of multi-vector threats matching shared IPs, users, and MITRE kill chain stages' },
    analytics: { title: 'Cyber Threat Analytics', subtitle: 'Incident distribution, risk histograms, top targeted assets, and tactical coverage' },
    add: { title: 'Ingest New Incident', subtitle: 'Manual alert ingestion studio with real-time mathematical score simulation' },
    simulation: { title: 'SOC Alert Simulation & Live Stream', subtitle: 'Trigger realistic APT attack waves and stream high-velocity events' },
    settings: { title: 'Scoring Weights & Engine Configuration', subtitle: 'Calibrate mathematical weights and tie-breaking policies' },
  };

  const current = titles[activeTab];
  const databaseLabel = databaseStatus === 'connected'
    ? 'Database Connected'
    : databaseStatus === 'syncing'
      ? 'Syncing Database'
      : 'Database Offline';

  return (
    <header className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          {current.title}
        </h1>
        <p className="text-xs text-slate-400 font-mono">{current.subtitle}</p>
      </div>

      <div className="flex items-center flex-wrap gap-2.5">
        <div
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono font-semibold ${
            databaseStatus === 'connected'
              ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
              : databaseStatus === 'syncing'
                ? 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                : 'bg-red-950/70 text-red-300 border-red-500/40'
          }`}
          title={databaseStatus === 'connected'
            ? 'Supabase is online. Incident changes are shared across browsers.'
            : databaseStatus === 'syncing'
              ? 'Checking the shared Supabase incident database.'
              : 'Supabase is temporarily unreachable. Local browser data remains available.'}
        >
          <span className={`w-2 h-2 rounded-full ${
            databaseStatus === 'connected'
              ? 'bg-emerald-400'
              : databaseStatus === 'syncing'
                ? 'bg-amber-400 animate-pulse'
                : 'bg-red-400'
          }`} />
          <Database className="w-3.5 h-3.5" />
          <span>{databaseLabel}</span>
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search IP, User, Asset..."
            value={filters.searchQuery}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, searchQuery: e.target.value }));
              if (activeTab !== 'queue') setActiveTab('queue');
            }}
            className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-44 md:w-56 font-mono"
          />
        </div>

        <button
          onClick={simulateBatchAlerts}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 text-xs font-mono font-medium border border-indigo-500/40 transition-all shadow-sm"
          title="Simulate 25+ correlated cybersecurity alerts"
        >
          <Flame className="w-3.5 h-3.5 text-indigo-400" />
          <span>Simulate Alerts</span>
        </button>

        <button
          onClick={() => setIsLiveMode(!isLiveMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all ${
            isLiveMode
              ? 'bg-red-950 text-red-300 border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.3)] animate-pulse'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-600'
          }`}
        >
          {isLiveMode ? (
            <>
              <Pause className="w-3.5 h-3.5 text-red-400" />
              <span>Live Streaming ON</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              <span>Start Live Mode</span>
            </>
          )}
        </button>

        <button
          onClick={exportDataJSON}
          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
          title="Export Prioritized Queue as JSON"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

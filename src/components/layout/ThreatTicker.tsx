import React from 'react';
import { AlertTriangle, X, ShieldAlert, Zap } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';

export const ThreatTicker: React.FC = () => {
  const { criticalAlertBanner, dismissCriticalBanner } = useIncidents();

  if (!criticalAlertBanner) return null;

  return (
    <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-500/50 px-6 py-2.5 flex items-center justify-between text-xs font-mono text-red-200 shadow-[0_4px_20px_rgba(239,68,68,0.25)] animate-slide-up sticky top-[61px] z-20">
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-900/90 text-red-100 font-bold border border-red-400/50 uppercase tracking-wide shrink-0 animate-pulse">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-300" />
          ALERT
        </span>
        <span className="truncate text-white font-medium">
          {criticalAlertBanner}
        </span>
        <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
          <Zap className="w-3 h-3 text-cyan-400" />
          Queue dynamically re-ranked
        </span>
      </div>

      <button
        onClick={dismissCriticalBanner}
        className="text-red-400 hover:text-white p-1 rounded hover:bg-red-900/50 transition-colors ml-4 shrink-0"
        title="Dismiss Alert"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

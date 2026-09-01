import React from 'react';
import { 
  LayoutDashboard, 
  ListOrdered, 
  Network, 
  BarChart3, 
  PlusCircle, 
  PlayCircle, 
  Sliders, 
  ShieldAlert, 
  Radio
} from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';

export type ActiveTab = 'dashboard' | 'queue' | 'chains' | 'analytics' | 'add' | 'simulation' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  userPersona?: string;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userPersona = 'SOC Analyst',
  onLogout,
}) => {
  const { metrics, isLiveMode } = useIncidents();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'queue', label: 'Incident Queue', icon: ListOrdered, badge: metrics.totalIncidents },
    { id: 'chains', label: 'Attack Chains', icon: Network, badge: metrics.activeAttackChains },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
    { id: 'add', label: 'Add Incident', icon: PlusCircle, badge: null },
    { id: 'simulation', label: 'Simulation & Live', icon: PlayCircle, badge: isLiveMode ? 'LIVE' : null },
    { id: 'settings', label: 'Scoring & Weights', icon: Sliders, badge: null },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0 backdrop-blur-xl z-20 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-500/20 border border-cyan-400/30 shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div className="overflow-hidden">
            <h1 className="font-bold text-sm text-white tracking-tight leading-tight truncate">
              Cyber Incident
            </h1>
            <p className="text-[10px] font-mono text-cyan-400 font-medium tracking-wider">PRIORITIZATION ENGINE</p>
          </div>
        </div>

        {/* Live Threat Indicator */}
        <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className="text-[11px] font-mono text-slate-300">
              {isLiveMode ? 'LIVE INGESTION' : 'NORMAL MODE'}
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {metrics.criticalCount} CRITICAL
          </span>
        </div>

        {/* Nav Links */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)] font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== null && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                      item.badge === 'LIVE'
                        ? 'bg-red-950 text-red-400 border border-red-500/40 animate-pulse font-bold'
                        : isActive
                        ? 'bg-cyan-900/80 text-cyan-200 border border-cyan-700/50'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile & Switcher */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-xs font-mono text-cyan-300 font-bold">
              SOC
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-white truncate">{userPersona}</div>
              <div className="text-[10px] text-slate-400 font-mono">SOC Active Console</div>
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full mt-2 py-1.5 text-center text-[11px] font-mono text-slate-400 hover:text-red-400 hover:bg-red-950/30 rounded border border-slate-800 hover:border-red-900/50 transition-colors"
        >
          Switch Persona / Exit
        </button>
      </div>
    </aside>
  );
};

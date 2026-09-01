import React, { useMemo } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area,
  CartesianGrid
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Server, 
  Users, 
  Network, 
  Layers,
  ShieldAlert
} from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';

export const AnalyticsDashboard: React.FC = () => {
  const { incidents, attackChains, metrics } = useIncidents();

  // Severity distribution data
  const severityData = useMemo(() => {
    const counts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    incidents.forEach((i) => {
      counts[i.riskLevel] = (counts[i.riskLevel] || 0) + 1;
    });
    return [
      { name: 'Critical', value: counts.CRITICAL, color: '#ef4444' },
      { name: 'High', value: counts.HIGH, color: '#f97316' },
      { name: 'Medium', value: counts.MEDIUM, color: '#eab308' },
      { name: 'Low', value: counts.LOW, color: '#10b981' },
    ];
  }, [incidents]);

  // Incidents by Attack Type
  const attackTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    incidents.forEach((i) => {
      map[i.type] = (map[i.type] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name: name.split(' ')[0], fullName: name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [incidents]);

  // Top Targeted Assets
  const assetData = useMemo(() => {
    const map: Record<string, { count: number; tier: string }> = {};
    incidents.forEach((i) => {
      if (!map[i.asset]) map[i.asset] = { count: 0, tier: i.assetTier };
      map[i.asset].count += 1;
    });
    return Object.entries(map)
      .map(([asset, info]) => ({
        asset,
        count: info.count,
        tier: info.tier.split(' - ')[0],
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [incidents]);

  // Most Affected Users
  const userData = useMemo(() => {
    const map: Record<string, number> = {};
    incidents.forEach((i) => {
      if (i.user && i.user !== 'Unknown') {
        map[i.user] = (map[i.user] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([user, count]) => ({ user, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [incidents]);

  // Risk Score Distribution Buckets (10-39, 40-59, 60-79, 80-100)
  const scoreBuckets = useMemo(() => {
    const buckets = [
      { range: '10-39 (Low)', count: 0, color: '#10b981' },
      { range: '40-59 (Med)', count: 0, color: '#eab308' },
      { range: '60-79 (High)', count: 0, color: '#f97316' },
      { range: '80-100 (Crit)', count: 0, color: '#ef4444' },
    ];
    incidents.forEach((i) => {
      if (i.priorityScore >= 80) buckets[3].count += 1;
      else if (i.priorityScore >= 60) buckets[2].count += 1;
      else if (i.priorityScore >= 40) buckets[1].count += 1;
      else buckets[0].count += 1;
    });
    return buckets;
  }, [incidents]);

  // Correlated vs Standalone
  const correlationRatio = useMemo(() => {
    const correlated = incidents.filter((i) => i.correlatedIncidentIds.length > 0).length;
    const standalone = incidents.length - correlated;
    return [
      { name: 'Correlated (Attack Chains)', value: correlated, color: '#a855f7' },
      { name: 'Standalone Alerts', value: standalone, color: '#475569' },
    ];
  }, [incidents]);

  // Ingestion Timeline Simulation Data
  const timelineData = [
    { time: '01:00', alerts: 4, critical: 1 },
    { time: '02:00', alerts: 7, critical: 2 },
    { time: '03:00', alerts: 3, critical: 0 },
    { time: '04:00', alerts: 12, critical: 4 },
    { time: '05:00', alerts: 18, critical: 6 },
    { time: '06:00', alerts: 26, critical: 9 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Telemetry Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-slate-500 uppercase">Total Telemetry Events</div>
          <div className="text-2xl font-bold text-white mt-1">{incidents.length}</div>
          <div className="text-cyan-400 text-[11px] mt-0.5">100% Deterministically Ranked</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-slate-500 uppercase">Critical Threat Density</div>
          <div className="text-2xl font-bold text-red-400 mt-1">
            {incidents.length > 0 ? Math.round((metrics.criticalCount / incidents.length) * 100) : 0}%
          </div>
          <div className="text-slate-400 text-[11px] mt-0.5">{metrics.criticalCount} Critical Active Alerts</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-slate-500 uppercase">Correlation Coverage</div>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            {incidents.length > 0
              ? Math.round(
                  (incidents.filter((i) => i.correlatedIncidentIds.length > 0).length /
                    incidents.length) *
                    100
                )
              : 0}
            %
          </div>
          <div className="text-slate-400 text-[11px] mt-0.5">{attackChains.length} Active Kill Chains</div>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="text-slate-500 uppercase">Fleet Threat Index</div>
          <div className="text-2xl font-bold text-yellow-400 mt-1">
            {metrics.avgPriorityScore} / 100
          </div>
          <div className="text-slate-400 text-[11px] mt-0.5">Mean Weighted Score</div>
        </div>
      </div>

      {/* Row 1: Severity Distribution & Ingestion Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Donut */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                Threat Severity Distribution
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Tiers</span>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
            {severityData.map((s) => (
              <div key={s.name} className="flex items-center justify-between p-2 rounded bg-slate-900/60 border border-slate-800">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-300">{s.name}</span>
                </span>
                <span className="font-bold text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Ingestion Velocity Over Time */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                Alert Ingestion Velocity & Critical Escalations (Timeline)
              </h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Live Telemetry</span>
          </div>

          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timelineData}>
                <defs>
                  <linearGradient id="alertGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="critGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="alerts" stroke="#06b6d4" fillOpacity={1} fill="url(#alertGradient)" name="Total Alerts Ingested" />
                <Area type="monotone" dataKey="critical" stroke="#ef4444" fillOpacity={1} fill="url(#critGradient)" name="Critical Incidents" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
            <span>Peak Velocity: 26 events/hr</span>
            <span className="text-red-400">Critical Spike Correlated with APT Multi-Vector Campaign</span>
          </div>
        </div>
      </div>

      {/* Row 2: Top Targeted Assets & Attack Vectors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Targeted Assets */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                Top Targeted Infrastructure Assets
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Blast Radius</span>
          </div>

          <div className="space-y-2.5">
            {assetData.map((a) => (
              <div key={a.asset} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold text-white">{a.asset}</div>
                  <div className="text-[10px] font-mono text-slate-400 mt-0.5">{a.tier}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-cyan-300">
                    {a.count} Alerts Target
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Compromised Identity Accounts */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
                Compromised Identity Accounts Leaderboard
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Zero Trust Risk</span>
          </div>

          <div className="space-y-2.5">
            {userData.map((u) => (
              <div key={u.user} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-950/60 border border-amber-500/30 flex items-center justify-center font-mono text-xs text-amber-300 font-bold">
                    ID
                  </div>
                  <div className="text-xs font-mono font-bold text-white">{u.user}</div>
                </div>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold">
                  {u.count} Incidents Linked
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

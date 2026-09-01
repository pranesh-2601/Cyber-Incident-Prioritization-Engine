import React, { useEffect, useState } from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  Flame, 
  Network, 
  Server, 
  Gauge, 
  Activity,
  ArrowUpRight
} from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';

// Animated counter hook
function useCountUp(target: number, duration: number = 800) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = count;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = Math.floor(progress * (target - startValue) + startValue);
      setCount(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    window.requestAnimationFrame(step);
  }, [target]);

  return count;
}

export const SummaryCards: React.FC<{ onNavigateToQueue?: () => void; onNavigateToChains?: () => void }> = ({
  onNavigateToQueue,
  onNavigateToChains,
}) => {
  const { metrics } = useIncidents();

  const animatedTotal = useCountUp(metrics.totalIncidents);
  const animatedCritical = useCountUp(metrics.criticalCount);
  const animatedHigh = useCountUp(metrics.highCount);
  const animatedChains = useCountUp(metrics.activeAttackChains);
  const animatedAssets = useCountUp(metrics.affectedAssetsCount);

  const cards = [
    {
      title: 'Total Incidents',
      value: animatedTotal,
      suffix: '',
      subtitle: `${metrics.mitigatedCount} mitigated`,
      icon: Activity,
      iconColor: 'text-cyan-400',
      bgGlow: 'hover:border-cyan-500/40',
      borderAccent: 'border-slate-800',
      onClick: onNavigateToQueue,
    },
    {
      title: 'Critical Incidents',
      value: animatedCritical,
      suffix: '',
      subtitle: 'Score ≥ 80 / 100',
      icon: ShieldAlert,
      iconColor: 'text-red-400',
      bgGlow: 'hover:border-red-500/50 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]',
      borderAccent: 'border-red-950/80',
      badge: 'URGENT',
      badgeColor: 'bg-red-950 text-red-400 border-red-500/40',
      onClick: onNavigateToQueue,
    },
    {
      title: 'High Priority',
      value: animatedHigh,
      suffix: '',
      subtitle: 'Score 60 - 79',
      icon: AlertTriangle,
      iconColor: 'text-orange-400',
      bgGlow: 'hover:border-orange-500/50',
      borderAccent: 'border-orange-950/80',
      onClick: onNavigateToQueue,
    },
    {
      title: 'Active Attack Chains',
      value: animatedChains,
      suffix: '',
      subtitle: 'Multi-vector correlated',
      icon: Network,
      iconColor: 'text-purple-400',
      bgGlow: 'hover:border-purple-500/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.2)]',
      borderAccent: 'border-purple-950/80',
      badge: 'KILL CHAIN',
      badgeColor: 'bg-purple-950 text-purple-400 border-purple-500/40',
      onClick: onNavigateToChains,
    },
    {
      title: 'Affected Assets',
      value: animatedAssets,
      suffix: '',
      subtitle: 'Crown Jewels & Infra',
      icon: Server,
      iconColor: 'text-blue-400',
      bgGlow: 'hover:border-blue-500/50',
      borderAccent: 'border-slate-800',
      onClick: onNavigateToQueue,
    },
    {
      title: 'Avg Priority Score',
      value: metrics.avgPriorityScore,
      suffix: '/100',
      subtitle: 'Fleet-wide threat index',
      icon: Gauge,
      iconColor: metrics.avgPriorityScore >= 70 ? 'text-red-400' : 'text-yellow-400',
      bgGlow: 'hover:border-yellow-500/50',
      borderAccent: 'border-slate-800',
      onClick: onNavigateToQueue,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c, idx) => {
        const Icon = c.icon;
        return (
          <div
            key={idx}
            onClick={c.onClick}
            className={`glass-panel p-4 rounded-xl border ${c.borderAccent} ${c.bgGlow} transition-all duration-200 cursor-pointer flex flex-col justify-between group relative overflow-hidden`}
          >
            {/* Top row */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                {c.title}
              </span>
              <Icon className={`w-4 h-4 ${c.iconColor} group-hover:scale-110 transition-transform`} />
            </div>

            {/* Middle value */}
            <div className="my-3 flex items-baseline gap-1">
              <span className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
                {c.value}
              </span>
              {c.suffix && (
                <span className="text-xs font-mono text-slate-400">{c.suffix}</span>
              )}
            </div>

            {/* Bottom meta */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] font-mono text-slate-400">
              <span className="truncate">{c.subtitle}</span>
              {c.badge && (
                <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${c.badgeColor}`}>
                  {c.badge}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

import React from 'react';
import { RiskLevel, IncidentStatus } from '../../types/incident';

export const RiskBadge: React.FC<{ level: RiskLevel; className?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  level,
  className = '',
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1 font-semibold',
    lg: 'text-sm px-3.5 py-1.5 font-bold',
  };

  const colors = {
    CRITICAL: 'bg-red-950/80 text-red-400 border-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.25)]',
    HIGH: 'bg-orange-950/80 text-orange-400 border-orange-500/40 shadow-[0_0_10px_rgba(249,115,22,0.2)]',
    MEDIUM: 'bg-yellow-950/70 text-yellow-400 border-yellow-500/30',
    LOW: 'bg-emerald-950/70 text-emerald-400 border-emerald-500/30',
  };

  const icons = {
    CRITICAL: '●',
    HIGH: '▲',
    MEDIUM: '■',
    LOW: '◆',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border uppercase tracking-wider font-mono ${colors[level]} ${sizeClasses[size]} ${className}`}
    >
      <span className="text-[10px]">{icons[level]}</span>
      {level}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IncidentStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const colors: Record<IncidentStatus, string> = {
    NEW: 'bg-cyan-950/80 text-cyan-400 border-cyan-500/40 animate-pulse',
    INVESTIGATING: 'bg-indigo-950/80 text-indigo-400 border-indigo-500/40',
    ESCALATED: 'bg-purple-950/80 text-purple-400 border-purple-500/40',
    MITIGATED: 'bg-emerald-950/70 text-emerald-400 border-emerald-500/30',
    SUPPRESSED: 'bg-slate-800 text-slate-400 border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border font-mono tracking-tight ${colors[status]} ${className}`}
    >
      {status}
    </span>
  );
};

export const AssetTierBadge: React.FC<{ tier: string; className?: string }> = ({ tier, className = '' }) => {
  let color = 'bg-slate-800 text-slate-300 border-slate-700';
  if (tier.includes('Tier 0')) color = 'bg-red-950/70 text-red-300 border-red-500/30';
  else if (tier.includes('Tier 1')) color = 'bg-amber-950/70 text-amber-300 border-amber-500/30';
  else if (tier.includes('Tier 2')) color = 'bg-blue-950/70 text-blue-300 border-blue-500/30';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono border ${color} ${className}`}>
      {tier.split(' - ')[0]}
    </span>
  );
};

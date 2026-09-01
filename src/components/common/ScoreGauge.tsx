import React from 'react';
import { getRiskLevel } from '../../utils/scoringEngine';

export const ScoreGauge: React.FC<{
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}> = ({ score, size = 'md', showLabel = true }) => {
  const risk = getRiskLevel(score);

  const colors = {
    CRITICAL: {
      text: 'text-red-400',
      stroke: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      glow: 'shadow-[0_0_15px_rgba(239,68,68,0.4)]',
    },
    HIGH: {
      text: 'text-orange-400',
      stroke: '#f97316',
      bg: 'rgba(249, 115, 22, 0.15)',
      glow: 'shadow-[0_0_12px_rgba(249,115,22,0.3)]',
    },
    MEDIUM: {
      text: 'text-yellow-400',
      stroke: '#eab308',
      bg: 'rgba(234, 179, 8, 0.15)',
      glow: 'shadow-[0_0_10px_rgba(234,179,8,0.2)]',
    },
    LOW: {
      text: 'text-emerald-400',
      stroke: '#10b981',
      bg: 'rgba(16, 185, 129, 0.15)',
      glow: '',
    },
  };

  const current = colors[risk];

  const dimensions = {
    sm: { width: 36, strokeWidth: 3.5, font: 'text-xs' },
    md: { width: 50, strokeWidth: 4.5, font: 'text-sm font-bold' },
    lg: { width: 80, strokeWidth: 6, font: 'text-xl font-extrabold' },
    xl: { width: 120, strokeWidth: 8, font: 'text-3xl font-black' },
  };

  const { width, strokeWidth, font } = dimensions[size];
  const radius = (width - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="inline-flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center">
        <svg width={width} height={width} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated score ring */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            stroke={current.stroke}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className={`absolute font-mono tracking-tight ${font} ${current.text}`}>
          {score.toFixed(0)}
        </span>
      </div>
      {showLabel && size !== 'sm' && (
        <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 mt-1">
          {risk}
        </span>
      )}
    </div>
  );
};

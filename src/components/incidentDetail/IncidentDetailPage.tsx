import React, { useState } from 'react';
import {
  ArrowLeft,
  Clock,
  Network,
  Layers,
  CheckCircle2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Incident } from '../../types/incident';
import { useIncidents } from '../../context/IncidentContext';
import { RiskBadge, StatusBadge, AssetTierBadge } from '../common/Badge';
import { ScoreGauge } from '../common/ScoreGauge';
import { FactorBreakdownBar } from '../explainability/FactorBreakdownBar';
import { IncidentActivityHistory } from './IncidentActivityHistory';
import { calculateFactorContributions } from '../../utils/scoringEngine';
import {
  analyzeIncident,
  AIAnalysisResult
} from '../../services/groqService';
import { recordAIThreatAnalysis } from '../../services/incidentAudit';
export const IncidentDetailPage: React.FC<{
  incident: Incident;
  onBack: () => void;
  onSelectCorrelated?: (inc: Incident) => void;
}> = ({ incident, onBack, onSelectCorrelated }) => {
  const { incidents, updateIncidentStatus } = useIncidents();

  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  const contributions = calculateFactorContributions(incident.factors);

  const correlatedIncidents = incidents.filter((i) =>
    incident.correlatedIncidentIds.includes(i.id)
  );

  const handleAnalyzeThreat = async () => {
    try {
      setIsAnalyzing(true);
      setAnalysisError('');
      setAiResult(null);

      const result = await analyzeIncident(incident);
      setAiResult(result);
    } catch (error) {
      console.error(error);
      setAnalysisError(
        'AI analysis failed. Make sure the backend server is running.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-300 transition-colors p-2 rounded-lg hover:bg-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Prioritized Queue</span>
        </button>

        <div className="flex items-center gap-3 flex-wrap justify-end">
          <StatusBadge status={incident.status} />

          <button
            onClick={handleAnalyzeThreat}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 disabled:opacity-60 disabled:cursor-not-allowed text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isAnalyzing ? 'Analyzing...' : 'Analyze Threat'}
            </span>
          </button>

          {incident.status !== 'MITIGATED' ? (
            <button
              onClick={() =>
                updateIncidentStatus(
                  incident.id,
                  'MITIGATED',
                  'Marked as mitigated by analyst.'
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Mitigated</span>
            </button>
          ) : (
            <button
              onClick={() =>
                updateIncidentStatus(
                  incident.id,
                  'INVESTIGATING',
                  'Re-opened for analysis.'
                )
              }
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
            >
              <span>Re-Open Alert</span>
            </button>
          )}
        </div>
      </div>

      {analysisError && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-300 font-mono">
          {analysisError}
        </div>
      )}

      {aiResult && (
        <div className="glass-panel p-6 rounded-xl border border-cyan-500/30 bg-gradient-to-br from-cyan-950/30 via-slate-950 to-purple-950/20 space-y-5">
          <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <div>
                <h2 className="text-sm font-bold text-white font-mono uppercase">
                  AI Threat Analysis
                </h2>
                <p className="text-[10px] text-slate-500 font-mono">
                  Decision-support layer
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono text-amber-300 border border-amber-500/30 bg-amber-950/30 px-2 py-1 rounded">
              Analyst review required
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="rounded-lg bg-slate-950/70 border border-slate-800 p-4">
              <div className="text-[10px] text-slate-500 uppercase font-mono">
                AI Verdict
              </div>
              <div className="text-sm font-bold text-cyan-300 mt-1">
                {aiResult.verdict}
              </div>
            </div>

            <div className="rounded-lg bg-slate-950/70 border border-slate-800 p-4">
              <div className="text-[10px] text-slate-500 uppercase font-mono">
                Confidence
              </div>
              <div className="text-2xl font-bold text-emerald-300 mt-1">
                {aiResult.confidence <= 1
  ? Math.round(aiResult.confidence * 100)
  : aiResult.confidence}%
              </div>
            </div>

            <div className="rounded-lg bg-slate-950/70 border border-slate-800 p-4">
              <div className="text-[10px] text-slate-500 uppercase font-mono">
                Threat Type
              </div>
              <div className="text-sm font-bold text-purple-300 mt-1">
                {aiResult.threatType}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold text-white font-mono uppercase mb-2">
              Explanation
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {aiResult.explanation}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <h3 className="text-xs font-bold text-white font-mono uppercase mb-2">
                Evidence
              </h3>
              <ul className="space-y-2">
                {aiResult.evidence.map((item, index) => (
                  <li
                    key={index}
                    className="text-xs text-slate-300 flex gap-2"
                  >
                    <span className="text-cyan-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-bold text-white font-mono uppercase mb-2">
                Recommended Actions
              </h3>
              <ul className="space-y-2">
                {aiResult.recommendedActions.map((item, index) => (
                  <li
                    key={index}
                    className="text-xs text-slate-300 flex gap-2"
                  >
                    <span className="text-emerald-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="glass-panel p-6 rounded-xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-sm font-black text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-500/40">
              #{incident.rank} {incident.id}
            </span>

            <RiskBadge level={incident.riskLevel} size="md" />
            <AssetTierBadge tier={incident.assetTier} />

            {incident.mitreId && (
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {incident.mitreId} • {incident.mitreTechnique}
              </span>
            )}
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            {incident.title}
          </h1>

          <p className="text-xs text-slate-300 max-w-2xl font-sans leading-relaxed">
            {incident.description}
          </p>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              {new Date(incident.timestamp).toLocaleString()}
            </span>

            <span>•</span>

            <span>
              Target Host:{' '}
              <span className="text-slate-200 font-bold">
                {incident.asset}
              </span>
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
          <ScoreGauge score={incident.priorityScore} size="xl" />

          <div className="text-[11px] font-mono text-cyan-400 mt-2 font-bold uppercase">
            Deterministic Score
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-500 text-[10px] uppercase">
            Attacker IP (Source)
          </span>
          <div className="text-cyan-400 font-bold text-sm mt-0.5 truncate">
            {incident.sourceIp}
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-500 text-[10px] uppercase">
            Destination IP
          </span>
          <div className="text-slate-200 font-bold text-sm mt-0.5 truncate">
            {incident.destinationIp || 'Internal LAN'}
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-500 text-[10px] uppercase">
            Compromised User
          </span>
          <div className="text-amber-300 font-bold text-sm mt-0.5 truncate">
            {incident.user}
          </div>
        </div>

        <div className="glass-panel p-3.5 rounded-xl border border-slate-800">
          <span className="text-slate-500 text-[10px] uppercase">
            Host Device Name
          </span>
          <div className="text-purple-300 font-bold text-sm mt-0.5 truncate">
            {incident.device || incident.asset}
          </div>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />

            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              Mathematical Score Weight Breakdown (7 Dimensions)
            </h3>
          </div>

          <span className="text-xs font-mono text-cyan-400 font-bold">
            Total Computed: {incident.priorityScore} / 100
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {contributions.map((c) => (
            <FactorBreakdownBar key={c.factor} contribution={c} />
          ))}
        </div>
      </div>

      {correlatedIncidents.length > 0 && (
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-purple-400" />

            <h3 className="text-xs font-bold font-mono text-white uppercase tracking-wider">
              Correlated Multi-Vector Alerts in Attack Chain (
              {correlatedIncidents.length})
            </h3>
          </div>

          <div className="space-y-2">
            {correlatedIncidents.map((corr) => (
              <div
                key={corr.id}
                onClick={() =>
                  onSelectCorrelated && onSelectCorrelated(corr)
                }
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/60 transition-all cursor-pointer flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-purple-300">
                    #{corr.rank}
                  </div>

                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors">
                      {corr.id} • {corr.type}
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono">
                      Asset: {corr.asset} • Attacker: {corr.sourceIp}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <RiskBadge level={corr.riskLevel} size="sm" />

                  <span className="text-xs font-mono font-bold text-white">
                    {corr.priorityScore}/100
                  </span>

                  <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <IncidentActivityHistory incidentId={incident.id} />
    </div>
  );
};
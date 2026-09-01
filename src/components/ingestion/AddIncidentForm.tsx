import React, { useState, useMemo } from 'react';
import { 
  PlusCircle, 
  Sparkles, 
  ShieldAlert, 
  Server, 
  User, 
  Layers, 
  Network, 
  Sliders, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';
import { AttackCategory, ScoringFactors, Incident } from '../../types/incident';
import { calculatePriorityScore, getRiskLevel, calculateFactorContributions } from '../../utils/scoringEngine';
import { ScoreGauge } from '../common/ScoreGauge';
import { RiskBadge } from '../common/Badge';

export const AddIncidentForm: React.FC<{
  onSuccessNavigateToQueue: () => void;
}> = ({ onSuccessNavigateToQueue }) => {
  const { addIncident, weights, incidents } = useIncidents();

  const [type, setType] = useState<AttackCategory>('Data Exfiltration');
  const [asset, setAsset] = useState('Core-Banking-DB-01');
  const [assetTier, setAssetTier] = useState<Incident['assetTier']>('Tier 0 - Crown Jewels');
  const [user, setUser] = useState('admin_jdoe');
  const [userRole, setUserRole] = useState('Enterprise Administrator');
  const [sourceIp, setSourceIp] = useState('198.51.100.77');
  const [destinationIp, setDestinationIp] = useState('10.0.4.15');
  const [description, setDescription] = useState(
    'Unauthorized outbound data burst detected across encrypted C2 channel to unapproved external IP.'
  );

  // 7 Scoring Factors
  const [factors, setFactors] = useState<ScoringFactors>({
    severity: 8.8,
    businessImpact: 8.5,
    assetImportance: 9.0,
    dataSensitivity: 9.2,
    attackConfidence: 8.5,
    affectedUsers: 7.0,
    correlationScore: 6.0,
  });

  const updateFactor = (key: keyof ScoringFactors, val: number) => {
    setFactors((prev) => ({ ...prev, [key]: val }));
  };

  // Real-time calculated score
  const liveScore = useMemo(() => {
    return calculatePriorityScore(factors, weights);
  }, [factors, weights]);

  const liveRisk = getRiskLevel(liveScore);

  // Check if this incident would correlate with existing items
  const potentialCorrelations = useMemo(() => {
    return incidents.filter(
      (i) =>
        i.sourceIp === sourceIp ||
        i.user.toLowerCase() === user.toLowerCase() ||
        i.asset.toLowerCase() === asset.toLowerCase()
    );
  }, [incidents, sourceIp, user, asset]);

  // Projected rank in current queue
  const projectedRank = useMemo(() => {
    const higherCount = incidents.filter((i) => i.priorityScore > liveScore).length;
    return higherCount + 1;
  }, [incidents, liveScore]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addIncident({
      title: `${type} Alert on ${asset}`,
      type,
      description,
      factors,
      sourceIp,
      destinationIp,
      asset,
      assetTier,
      user,
      userRole,
      device: `srv-${asset.toLowerCase()}`,
      timestamp: new Date().toISOString(),
      status: 'NEW',
      recommendedActions: [
        `Isolate target host ${asset} from production cluster`,
        `Apply perimeter firewall drop rule for IP ${sourceIp}`,
        `Force password reset & session revocation for user ${user}`,
      ],
    });

    onSuccessNavigateToQueue();
  };

  const categories: AttackCategory[] = [
    'Data Exfiltration',
    'Privilege Escalation',
    'Ransomware Activity',
    'Malware Detection',
    'Brute-Force Attack',
    'Failed Login Attempts',
    'Suspicious PowerShell',
    'Impossible Travel Login',
    'Suspicious Email / Phishing',
    'Port Scan & Recon',
    'C2 Communication',
    'Lateral Movement',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Inputs */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Manual Incident Ingestion Studio
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Input entity telemetry and tune 7-factor weights for immediate ranking
              </p>
            </div>
            <PlusCircle className="w-5 h-5 text-cyan-400" />
          </div>

          {/* Core Entity Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Attack Category */}
            <div>
              <label className="text-slate-400 block mb-1">Incident Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AttackCategory)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Asset Name */}
            <div>
              <label className="text-slate-400 block mb-1">Target Asset Hostname</label>
              <input
                type="text"
                value={asset}
                onChange={(e) => setAsset(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Asset Tier */}
            <div>
              <label className="text-slate-400 block mb-1">Asset Criticality Tier</label>
              <select
                value={assetTier}
                onChange={(e) => setAssetTier(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Tier 0 - Crown Jewels">Tier 0 - Crown Jewels (Domain / DB)</option>
                <option value="Tier 1 - Mission Critical">Tier 1 - Mission Critical (App / Identity)</option>
                <option value="Tier 2 - Business Operations">Tier 2 - Business Operations</option>
                <option value="Tier 3 - General Endpoint">Tier 3 - General Endpoint</option>
              </select>
            </div>

            {/* User Identity */}
            <div>
              <label className="text-slate-400 block mb-1">Impacted Account / Username</label>
              <input
                type="text"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Source IP */}
            <div>
              <label className="text-slate-400 block mb-1">Source / Attacker IP</label>
              <input
                type="text"
                value={sourceIp}
                onChange={(e) => setSourceIp(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>

            {/* Destination IP */}
            <div>
              <label className="text-slate-400 block mb-1">Destination IP</label>
              <input
                type="text"
                value={destinationIp}
                onChange={(e) => setDestinationIp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div className="text-xs font-mono">
            <label className="text-slate-400 block mb-1">Telemetry Narrative Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none font-sans text-xs"
            />
          </div>

          {/* 7 Scoring Factor Sliders */}
          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
              <span>7 Mathematical Scoring Dimensions (1.0 - 10.0)</span>
              <span>Normalized in Real-Time</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Severity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Severity (22%)</span>
                  <span className="text-cyan-400 font-bold">{factors.severity}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={factors.severity}
                  onChange={(e) => updateFactor('severity', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Business Impact */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Business Impact (18%)</span>
                  <span className="text-cyan-400 font-bold">{factors.businessImpact}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={factors.businessImpact}
                  onChange={(e) => updateFactor('businessImpact', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Asset Importance */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Asset Importance (15%)</span>
                  <span className="text-cyan-400 font-bold">{factors.assetImportance}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={factors.assetImportance}
                  onChange={(e) => updateFactor('assetImportance', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Data Sensitivity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Data Sensitivity (15%)</span>
                  <span className="text-cyan-400 font-bold">{factors.dataSensitivity}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={factors.dataSensitivity}
                  onChange={(e) => updateFactor('dataSensitivity', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Attack Confidence */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Attack Confidence (12%)</span>
                  <span className="text-cyan-400 font-bold">{factors.attackConfidence}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={factors.attackConfidence}
                  onChange={(e) => updateFactor('attackConfidence', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Affected Users */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Affected Users (8%)</span>
                  <span className="text-cyan-400 font-bold">{factors.affectedUsers}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={factors.affectedUsers}
                  onChange={(e) => updateFactor('affectedUsers', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>

              {/* Correlation Score */}
              <div className="space-y-1 md:col-span-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Initial Correlation Factor (10%)</span>
                  <span className="text-cyan-400 font-bold">{factors.correlationScore}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="0.1"
                  value={factors.correlationScore}
                  onChange={(e) => updateFactor('correlationScore', parseFloat(e.target.value))}
                  className="w-full accent-cyan-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Live Priority Score Preview & Analyze Button */}
        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-xl border border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-slate-900 shadow-xl space-y-4">
            <div className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-bold">
              Real-Time Score Simulation
            </div>

            <div className="flex flex-col items-center justify-center p-4 bg-slate-950/60 rounded-xl border border-slate-800">
              <ScoreGauge score={liveScore} size="xl" />
              <div className="mt-3 flex items-center gap-2">
                <RiskBadge level={liveRisk} size="md" />
              </div>
              <div className="mt-2 text-xs font-mono text-cyan-300 font-bold">
                Projected Queue Rank: #{projectedRank}
              </div>
            </div>

            {/* Potential Correlation Warning */}
            {potentialCorrelations.length > 0 ? (
              <div className="p-3 rounded-lg bg-purple-950/60 border border-purple-500/40 text-xs font-mono text-purple-200 flex items-start gap-2">
                <Network className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Autonomous Link Found!</div>
                  <div className="text-[11px] text-purple-300">
                    Matches {potentialCorrelations.length} existing alerts (IP: {sourceIp}). Will attach to active attack chain upon ingestion.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
                Operating as standalone alert.
              </div>
            )}

            {/* Analyze Incident Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold font-mono text-xs tracking-wider uppercase transition-all shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Analyze & Rank Incident</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

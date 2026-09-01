import React, { useMemo, useState } from 'react';
import { Network, PlusCircle, Sparkles } from 'lucide-react';
import { useIncidents } from '../../context/IncidentContext';
import { AttackCategory, Incident, ScoringFactors } from '../../types/incident';
import { FACTOR_LABELS, getRiskLevel, rankIncidents } from '../../utils/scoringEngine';
import { areIncidentsCorrelated, correlateAllIncidents } from '../../utils/correlationEngine';
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

  const previewIncident = useMemo<Incident>(() => ({
    id: '__PREVIEW_INCIDENT__',
    title: `${type} Alert on ${asset}`,
    type,
    description,
    factors,
    weightedScore: 0,
    priorityScore: 0,
    riskLevel: 'LOW',
    sourceIp,
    destinationIp,
    asset,
    assetTier,
    user,
    userRole,
    device: `srv-${asset.toLowerCase()}`,
    timestamp: new Date().toISOString(),
    correlatedIncidentIds: [],
    status: 'NEW',
    recommendedActions: [],
  }), [type, asset, description, factors, sourceIp, destinationIp, assetTier, user, userRole]);

  const potentialCorrelations = useMemo(
    () => incidents.filter((incident) => areIncidentsCorrelated(previewIncident, incident)),
    [incidents, previewIncident]
  );

  const previewResult = useMemo(() => {
    const pool = [...incidents, previewIncident];
    const { correlatedIncidents } = correlateAllIncidents(pool);
    const ranked = rankIncidents(correlatedIncidents, weights);
    return ranked.find((incident) => incident.id === previewIncident.id);
  }, [incidents, previewIncident, weights]);

  const liveScore = previewResult?.priorityScore ?? 0;
  const liveRisk = previewResult?.riskLevel ?? getRiskLevel(liveScore);
  const projectedRank = previewResult?.rank ?? incidents.length + 1;
  const dynamicCorrelationScore = previewResult?.factors.correlationScore ?? factors.correlationScore;

  const weightSum = Object.values(weights).reduce((sum, value) => sum + value, 0) || 1;
  const factorKeys: (keyof ScoringFactors)[] = [
    'severity',
    'businessImpact',
    'assetImportance',
    'dataSensitivity',
    'attackConfidence',
    'affectedUsers',
    'correlationScore',
  ];

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
        <div className="lg:col-span-2 glass-panel p-6 rounded-xl border border-slate-800 space-y-6">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Manual Incident Ingestion Studio
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Input entity telemetry and preview the exact post-correlation queue rank
              </p>
            </div>
            <PlusCircle className="w-5 h-5 text-cyan-400" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Incident Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as AttackCategory)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

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

            <div>
              <label className="text-slate-400 block mb-1">Asset Criticality Tier</label>
              <select
                value={assetTier}
                onChange={(e) => setAssetTier(e.target.value as Incident['assetTier'])}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none"
              >
                <option value="Tier 0 - Crown Jewels">Tier 0 - Crown Jewels (Domain / DB)</option>
                <option value="Tier 1 - Mission Critical">Tier 1 - Mission Critical (App / Identity)</option>
                <option value="Tier 2 - Business Operations">Tier 2 - Business Operations</option>
                <option value="Tier 3 - General Endpoint">Tier 3 - General Endpoint</option>
              </select>
            </div>

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

          <div className="text-xs font-mono">
            <label className="text-slate-400 block mb-1">Telemetry Narrative Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:border-cyan-500 focus:outline-none font-sans text-xs"
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400 font-bold">
              <span>7 Mathematical Scoring Dimensions (1.0 - 10.0)</span>
              <span>Normalized in Real-Time</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {factorKeys.map((key) => {
                const normalizedWeight = Math.round((weights[key] / weightSum) * 100);
                const shownValue = key === 'correlationScore' ? dynamicCorrelationScore : factors[key];
                return (
                  <div key={key} className={key === 'correlationScore' ? 'space-y-1 md:col-span-2' : 'space-y-1'}>
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">
                        {FACTOR_LABELS[key].name} ({normalizedWeight}% effective)
                      </span>
                      <span className="text-cyan-400 font-bold">{shownValue}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="0.1"
                      value={factors[key]}
                      onChange={(e) => updateFactor(key, parseFloat(e.target.value))}
                      disabled={key === 'correlationScore'}
                      className={`w-full accent-cyan-500 ${key === 'correlationScore' ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                    {key === 'correlationScore' && (
                      <p className="text-[10px] text-slate-500 font-mono">
                        Correlation is computed automatically from shared IPs, users, assets, devices and lateral links.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

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

            {potentialCorrelations.length > 0 ? (
              <div className="p-3 rounded-lg bg-purple-950/60 border border-purple-500/40 text-xs font-mono text-purple-200 flex items-start gap-2">
                <Network className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Autonomous Link Found!</div>
                  <div className="text-[11px] text-purple-300">
                    Matches {potentialCorrelations.length} existing alert(s). Dynamic correlation score: {dynamicCorrelationScore}/10.
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
                Operating as standalone alert. Dynamic correlation score: {dynamicCorrelationScore}/10.
              </div>
            )}

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

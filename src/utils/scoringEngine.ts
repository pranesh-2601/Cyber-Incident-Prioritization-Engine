import { Incident, RiskLevel, ScoringFactors, FactorWeights, FactorContribution } from '../types/incident';

export const DEFAULT_WEIGHTS: FactorWeights = {
  severity: 0.22,
  businessImpact: 0.18,
  assetImportance: 0.15,
  dataSensitivity: 0.15,
  attackConfidence: 0.12,
  affectedUsers: 0.08,
  correlationScore: 0.10,
};

export const FACTOR_LABELS: Record<keyof ScoringFactors, { name: string; description: string }> = {
  severity: {
    name: 'Severity',
    description: 'Technical exploit severity, CVSS baseline, and weaponization level.',
  },
  businessImpact: {
    name: 'Business Impact',
    description: 'Potential disruption to revenue, operations, compliance, or brand.',
  },
  assetImportance: {
    name: 'Asset Importance',
    description: 'Criticality tier of target host (Crown Jewels, Domain Controller, Core DB).',
  },
  dataSensitivity: {
    name: 'Data Sensitivity',
    description: 'Classification of data stored or accessed (PII, Financial, PHI, Secrets).',
  },
  attackConfidence: {
    name: 'Attack Confidence',
    description: 'Detection fidelity, telemetry evidence strength, and low false-positive rate.',
  },
  affectedUsers: {
    name: 'Affected Users',
    description: 'Blast radius measured by number and privilege tier of impacted identities.',
  },
  correlationScore: {
    name: 'Correlation Score',
    description: 'Strength of link to active attack chains, multi-vector alerts, and shared entities.',
  },
};

export function getWeightSum(weights: FactorWeights = DEFAULT_WEIGHTS): number {
  return Object.values(weights).reduce((a, b) => a + b, 0) || 1.0;
}

/**
 * Calculates raw weighted score (1.0 - 10.0) based on configured weights.
 * Weights are normalized by their total so custom weight sets remain on the same scale.
 */
export function calculateWeightedScore(
  factors: ScoringFactors,
  weights: FactorWeights = DEFAULT_WEIGHTS
): number {
  const sumWeights = getWeightSum(weights);

  const rawWeighted = (
    factors.severity * weights.severity +
    factors.businessImpact * weights.businessImpact +
    factors.assetImportance * weights.assetImportance +
    factors.dataSensitivity * weights.dataSensitivity +
    factors.attackConfidence * weights.attackConfidence +
    factors.affectedUsers * weights.affectedUsers +
    factors.correlationScore * weights.correlationScore
  ) / sumWeights;

  return Math.min(10.0, Math.max(1.0, rawWeighted));
}

/**
 * Calculates final priority score (10.0 - 100.0)
 */
export function calculatePriorityScore(
  factors: ScoringFactors,
  weights: FactorWeights = DEFAULT_WEIGHTS
): number {
  const weightedScore = calculateWeightedScore(factors, weights);
  const finalScore = weightedScore * 10;
  return Math.round(finalScore * 10) / 10;
}

/**
 * Derives risk tier from final priority score
 */
export function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

/**
 * Computes individual factor contributions to the final score using the same
 * normalized-weight math as calculatePriorityScore().
 */
export function calculateFactorContributions(
  factors: ScoringFactors,
  weights: FactorWeights = DEFAULT_WEIGHTS
): FactorContribution[] {
  const finalScore = calculatePriorityScore(factors, weights);
  const sumWeights = getWeightSum(weights);
  const keys: (keyof ScoringFactors)[] = [
    'severity',
    'businessImpact',
    'assetImportance',
    'dataSensitivity',
    'attackConfidence',
    'affectedUsers',
    'correlationScore'
  ];

  return keys.map((key) => {
    const val = factors[key];
    const weight = weights[key];
    const normalizedWeight = weight / sumWeights;
    const contribution = Math.round(val * normalizedWeight * 10 * 10) / 10;
    const percentage = finalScore > 0 ? Math.round((contribution / finalScore) * 100) : 0;

    return {
      factor: key,
      name: FACTOR_LABELS[key].name,
      value: val,
      weight: normalizedWeight,
      contribution,
      percentage,
    };
  });
}

/**
 * Deterministic Hackathon Tie-Breaking Comparator:
 * 1. Final Priority Score (Higher wins)
 * 2. Correlation Score (Higher wins)
 * 3. Severity (Higher wins)
 * 4. Asset Importance (Higher wins)
 * 5. Timestamp (More recent wins)
 */
export function compareIncidents(a: Incident, b: Incident): number {
  if (b.priorityScore !== a.priorityScore) {
    return b.priorityScore - a.priorityScore;
  }
  if (b.factors.correlationScore !== a.factors.correlationScore) {
    return b.factors.correlationScore - a.factors.correlationScore;
  }
  if (b.factors.severity !== a.factors.severity) {
    return b.factors.severity - a.factors.severity;
  }
  if (b.factors.assetImportance !== a.factors.assetImportance) {
    return b.factors.assetImportance - a.factors.assetImportance;
  }
  const timeA = new Date(a.timestamp).getTime();
  const timeB = new Date(b.timestamp).getTime();
  return timeB - timeA;
}

/**
 * Re-ranks entire incident queue and assigns 1-indexed rank
 */
export function rankIncidents(
  incidents: Incident[],
  weights: FactorWeights = DEFAULT_WEIGHTS
): Incident[] {
  const updated = incidents.map((inc) => {
    const weightedScore = calculateWeightedScore(inc.factors, weights);
    const priorityScore = calculatePriorityScore(inc.factors, weights);
    const riskLevel = getRiskLevel(priorityScore);
    return {
      ...inc,
      weightedScore,
      priorityScore,
      riskLevel,
    };
  });

  const sorted = [...updated].sort(compareIncidents);

  return sorted.map((inc, index) => ({
    ...inc,
    rank: index + 1,
  }));
}

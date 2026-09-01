import { Incident, FactorContribution, FactorWeights } from '../types/incident';
import { calculateFactorContributions, FACTOR_LABELS, DEFAULT_WEIGHTS } from './scoringEngine';

export interface RankingExplanation {
  summary: string;
  keyDrivers: string[];
  mitigatingFactors: string[];
  contributions: FactorContribution[];
  correlationNarrative?: string;
  recommendedUrgency: string;
}

export interface ComparisonDelta {
  factor: string;
  factorKey: keyof Incident['factors'];
  incidentAValue: number;
  incidentBValue: number;
  pointDiff: number;
  explanation: string;
}

export interface PairwiseComparison {
  higherIncident: Incident;
  lowerIncident: Incident;
  overallScoreDiff: number;
  narrative: string;
  deltas: ComparisonDelta[];
  dominantFactor: string;
}

export function generateRankingExplanation(
  incident: Incident,
  allIncidents: Incident[],
  weights: FactorWeights = DEFAULT_WEIGHTS
): RankingExplanation {
  const contributions = calculateFactorContributions(incident.factors, weights);
  const sortedContributions = [...contributions].sort((a, b) => b.contribution - a.contribution);

  const topFactors = sortedContributions.slice(0, 3);
  const lowestFactor = sortedContributions[sortedContributions.length - 1];

  const keyDrivers: string[] = topFactors.map((c) => {
    if (c.factor === 'severity') {
      return `Critical technical severity (${c.value}/10) contributing +${c.contribution.toFixed(1)} pts to the risk total.`;
    }
    if (c.factor === 'businessImpact') {
      return `High business impact (${c.value}/10) reflecting severe operational disruption risks (+${c.contribution.toFixed(1)} pts).`;
    }
    if (c.factor === 'dataSensitivity') {
      return `Exposed data sensitivity rating (${c.value}/10) targeting classified/confidential records (+${c.contribution.toFixed(1)} pts).`;
    }
    if (c.factor === 'assetImportance') {
      return `Target host is categorized as ${incident.assetTier} (${c.value}/10) (+${c.contribution.toFixed(1)} pts).`;
    }
    if (c.factor === 'attackConfidence') {
      return `High telemetry detection confidence (${c.value}/10) with verified malicious indicators (+${c.contribution.toFixed(1)} pts).`;
    }
    if (c.factor === 'correlationScore') {
      return `Correlated with ${incident.correlatedIncidentIds.length} related security events in active attack chain (+${c.contribution.toFixed(1)} pts).`;
    }
    return `Affects widespread user pool (${c.value}/10) (+${c.contribution.toFixed(1)} pts).`;
  });

  const mitigatingFactors: string[] = [];
  if (lowestFactor.value <= 4) {
    mitigatingFactors.push(
      `Relatively lower ${lowestFactor.name.toLowerCase()} score (${lowestFactor.value}/10) constrained the final priority score from reaching peak critical thresholds.`
    );
  }

  let correlationNarrative = '';
  if (incident.correlatedIncidentIds.length > 0) {
    const correlatedIncidents = allIncidents.filter((i) =>
      incident.correlatedIncidentIds.includes(i.id)
    );
    const sharedIps = Array.from(
      new Set(correlatedIncidents.map((i) => i.sourceIp).filter((ip) => ip && ip !== 'Unknown' && ip === incident.sourceIp))
    );
    const sharedUsers = Array.from(
      new Set(correlatedIncidents.map((i) => i.user).filter((u) => u && u !== 'Unknown' && u !== 'System' && u === incident.user))
    );

    const connections: string[] = [];
    if (sharedIps.length > 0) connections.push(`same source IP (${sharedIps.join(', ')})`);
    if (sharedUsers.length > 0) connections.push(`same identity account (${sharedUsers.join(', ')})`);

    const correlationContribution = contributions.find((c) => c.factor === 'correlationScore')?.contribution ?? 0;
    correlationNarrative = `This alert is linked to ${incident.correlatedIncidentIds.length} other active alerts sharing ${
      connections.join(' and ') || 'target assets and attack progression vectors'
    }, elevating its correlation score to ${incident.factors.correlationScore}/10 (+${correlationContribution.toFixed(1)} pts).`;
  } else {
    correlationNarrative =
      'This incident is currently operating as an isolated alert with no verified lateral chain links detected so far.';
  }

  const rankStr = incident.rank ? `#${incident.rank}` : 'top queue';
  const summary = `This incident ranks ${rankStr} with a Priority Score of ${incident.priorityScore}/100 (${incident.riskLevel}). The ranking is primarily propelled by its ${
    topFactors[0]?.name.toLowerCase() || 'severity'
  } (${topFactors[0]?.value}/10) targeting ${incident.asset} (${incident.assetTier}), ${
    incident.correlatedIncidentIds.length > 0
      ? `and strong correlation with ${incident.correlatedIncidentIds.length} interconnected alerts in an active attack chain.`
      : 'with high telemetry confidence.'
  }`;

  let recommendedUrgency = 'Standard SLA triage within 4 hours.';
  if (incident.priorityScore >= 85) {
    recommendedUrgency = 'IMMEDIATE SEV-1 ACTION: Isolate host and engage Tier 3 CIRT within 15 minutes.';
  } else if (incident.priorityScore >= 70) {
    recommendedUrgency = 'HIGH URGENCY: Tier 2 SOC Analyst investigation required within 30 minutes.';
  } else if (incident.priorityScore >= 50) {
    recommendedUrgency = 'ELEVATED: Triage and contain within 60 minutes.';
  }

  return {
    summary,
    keyDrivers,
    mitigatingFactors,
    contributions,
    correlationNarrative,
    recommendedUrgency,
  };
}

export function compareIncidentsExplainable(
  incidentA: Incident,
  incidentB: Incident,
  weights: FactorWeights = DEFAULT_WEIGHTS
): PairwiseComparison {
  const higher = incidentA.priorityScore >= incidentB.priorityScore ? incidentA : incidentB;
  const lower = incidentA.priorityScore >= incidentB.priorityScore ? incidentB : incidentA;

  const scoreDiff = Math.round((higher.priorityScore - lower.priorityScore) * 10) / 10;
  const contributionsHigher = calculateFactorContributions(higher.factors, weights);
  const contributionsLower = calculateFactorContributions(lower.factors, weights);

  const deltas: ComparisonDelta[] = contributionsHigher.map((cA) => {
    const cB = contributionsLower.find((item) => item.factor === cA.factor)!;
    const diff = Math.round((cA.contribution - cB.contribution) * 10) / 10;
    const factorName = FACTOR_LABELS[cA.factor].name;

    let explanation = '';
    if (diff > 0) {
      explanation = `${higher.id} scored higher in ${factorName} (${cA.value}/10 vs ${cB.value}/10), adding +${diff.toFixed(1)} net points.`;
    } else if (diff < 0) {
      explanation = `${lower.id} scored higher in ${factorName} (${cB.value}/10 vs ${cA.value}/10), offset by ${Math.abs(diff).toFixed(1)} points.`;
    } else {
      explanation = `Both incidents scored identically in ${factorName} (${cA.value}/10).`;
    }

    return {
      factor: factorName,
      factorKey: cA.factor,
      incidentAValue: cA.value,
      incidentBValue: cB.value,
      pointDiff: diff,
      explanation,
    };
  });

  const dominant = [...deltas].sort((a, b) => b.pointDiff - a.pointDiff)[0];

  let narrative = '';
  if (scoreDiff === 0) {
    narrative = `${higher.id} and ${lower.id} have identical priority scores (${higher.priorityScore}/100). ${higher.id} is placed higher due to deterministic tie-breaking (higher correlation/severity/asset tier or recent timestamp).`;
  } else {
    narrative = `${higher.id} (#${higher.rank ?? 1}) outranks ${lower.id} (#${lower.rank ?? 2}) by ${scoreDiff} points. The decisive factor is ${dominant.factor} where ${higher.id} achieved ${dominant.incidentAValue}/10 compared to ${dominant.incidentBValue}/10, yielding a +${dominant.pointDiff.toFixed(1)} point advantage.`;
  }

  return {
    higherIncident: higher,
    lowerIncident: lower,
    overallScoreDiff: scoreDiff,
    narrative,
    deltas,
    dominantFactor: dominant.factor,
  };
}

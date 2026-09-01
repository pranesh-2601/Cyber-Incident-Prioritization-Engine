import { Incident, AttackChain, AttackChainNode, AttackCategory } from '../types/incident';

// Mapping of attack types to MITRE Cyber Kill Chain / ATT&CK stages
export const ATTACK_STAGE_MAP: Record<AttackCategory, AttackChainNode['stage']> = {
  'Port Scan & Recon': 'Initial Access',
  'Suspicious Email / Phishing': 'Initial Access',
  'Failed Login Attempts': 'Credential Access',
  'Brute-Force Attack': 'Credential Access',
  'Impossible Travel Login': 'Execution',
  'Suspicious PowerShell': 'Execution',
  'Privilege Escalation': 'Privilege Escalation',
  'Malware Detection': 'Execution',
  'Lateral Movement': 'Lateral Movement',
  'C2 Communication': 'Lateral Movement',
  'Data Exfiltration': 'Exfiltration',
  'Ransomware Activity': 'Impact',
};

export const STAGE_ORDER: Record<AttackChainNode['stage'], number> = {
  'Initial Access': 1,
  'Execution': 2,
  'Credential Access': 3,
  'Privilege Escalation': 4,
  'Lateral Movement': 5,
  'Exfiltration': 6,
  'Impact': 7,
};

export const MITRE_TECHNIQUES: Record<AttackCategory, { id: string; name: string; tactic: string }> = {
  'Suspicious Email / Phishing': { id: 'T1566', name: 'Phishing: Spearphishing Link', tactic: 'Initial Access' },
  'Port Scan & Recon': { id: 'T1046', name: 'Network Service Discovery', tactic: 'Discovery' },
  'Failed Login Attempts': { id: 'T1110.001', name: 'Brute Force: Password Guessing', tactic: 'Credential Access' },
  'Brute-Force Attack': { id: 'T1110.003', name: 'Brute Force: Password Spraying', tactic: 'Credential Access' },
  'Impossible Travel Login': { id: 'T1078.004', name: 'Valid Accounts: Cloud Accounts', tactic: 'Initial Access' },
  'Suspicious PowerShell': { id: 'T1059.001', name: 'Command & Scripting Interpreter: PowerShell', tactic: 'Execution' },
  'Malware Detection': { id: 'T1204.002', name: 'User Execution: Malicious File', tactic: 'Execution' },
  'Privilege Escalation': { id: 'T1068', name: 'Exploitation for Privilege Escalation', tactic: 'Privilege Escalation' },
  'Lateral Movement': { id: 'T1021.002', name: 'Remote Services: SMB/Windows Admin Shares', tactic: 'Lateral Movement' },
  'C2 Communication': { id: 'T1071.001', name: 'Application Layer Protocol: Web Protocols', tactic: 'Command and Control' },
  'Data Exfiltration': { id: 'T1041', name: 'Exfiltration Over C2 Channel', tactic: 'Exfiltration' },
  'Ransomware Activity': { id: 'T1486', name: 'Data Encrypted for Impact', tactic: 'Impact' },
};

const isKnownValue = (value?: string): value is string => {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized !== 'unknown' && normalized !== 'n/a' && normalized !== 'none';
};

/**
 * Checks if two incidents share one or more entity attributes
 */
export function areIncidentsCorrelated(a: Incident, b: Incident): boolean {
  if (a.id === b.id) return false;

  const sameSrcIp = Boolean(isKnownValue(a.sourceIp) && isKnownValue(b.sourceIp) && a.sourceIp === b.sourceIp);
  const sameDestIp = Boolean(isKnownValue(a.destinationIp) && isKnownValue(b.destinationIp) && a.destinationIp === b.destinationIp);
  const sameUser = Boolean(
    isKnownValue(a.user) &&
    isKnownValue(b.user) &&
    a.user.toLowerCase() === b.user.toLowerCase() &&
    a.user.toLowerCase() !== 'system'
  );
  const sameAsset = Boolean(isKnownValue(a.asset) && isKnownValue(b.asset) && a.asset.toLowerCase() === b.asset.toLowerCase());
  const sameDevice = Boolean(isKnownValue(a.device) && isKnownValue(b.device) && a.device.toLowerCase() === b.device.toLowerCase());

  // Cross-entity matching: e.g. A's dest IP is B's source IP (lateral movement).
  // Unknown/placeholder values must never create a correlation edge.
  const lateralLink = Boolean(
    (isKnownValue(a.destinationIp) && isKnownValue(b.sourceIp) && a.destinationIp === b.sourceIp) ||
    (isKnownValue(b.destinationIp) && isKnownValue(a.sourceIp) && b.destinationIp === a.sourceIp)
  );

  return sameSrcIp || sameDestIp || sameUser || sameAsset || sameDevice || lateralLink;
}

/**
 * Calculates dynamic correlation score (1.0 - 10.0) based on link density, shared entities, and kill-chain depth
 */
export function computeCorrelationScore(
  incident: Incident,
  allIncidents: Incident[]
): { score: number; correlatedIds: string[] } {
  const correlated = allIncidents.filter((other) => areIncidentsCorrelated(incident, other));
  const count = correlated.length;

  if (count === 0) {
    return { score: 1.0, correlatedIds: [] };
  }

  let score = 2.0 + Math.min(count * 1.5, 5.0);

  const currentStageNum = STAGE_ORDER[ATTACK_STAGE_MAP[incident.type] || 'Execution'];
  const stages = new Set(correlated.map((c) => ATTACK_STAGE_MAP[c.type]));
  if (stages.size >= 2) score += 1.5;
  if (stages.size >= 3) score += 1.5;
  if (currentStageNum >= 5) score += 1.0;

  const finalScore = Math.min(10.0, Math.round(score * 10) / 10);
  return {
    score: finalScore,
    correlatedIds: correlated.map((c) => c.id),
  };
}

/**
 * Discovers and builds distinct Attack Chains from an alert pool
 */
export function buildAttackChains(incidents: Incident[]): AttackChain[] {
  const chains: AttackChain[] = [];
  const visited = new Set<string>();

  for (const incident of incidents) {
    if (visited.has(incident.id)) continue;

    const cluster: Incident[] = [];
    const queue = [incident];
    visited.add(incident.id);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      cluster.push(curr);

      for (const other of incidents) {
        if (!visited.has(other.id) && areIncidentsCorrelated(curr, other)) {
          visited.add(other.id);
          queue.push(other);
        }
      }
    }

    if (cluster.length >= 2) {
      cluster.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

      const chainId = `CHAIN-${cluster[0].id.replace('INC-', '')}-${cluster.length}`;
      const srcIps = Array.from(new Set(cluster.map((c) => c.sourceIp).filter(isKnownValue)));
      const destIps = Array.from(new Set(cluster.map((c) => c.destinationIp).filter(isKnownValue)));
      const users = Array.from(new Set(cluster.map((c) => c.user).filter(isKnownValue)));
      const assets = Array.from(new Set(cluster.map((c) => c.asset).filter(isKnownValue)));

      const nodes: AttackChainNode[] = cluster.map((inc) => {
        const stage = ATTACK_STAGE_MAP[inc.type] || 'Execution';
        const mitre = MITRE_TECHNIQUES[inc.type];
        return {
          id: `node-${inc.id}`,
          incidentId: inc.id,
          type: inc.type,
          timestamp: inc.timestamp,
          sourceIp: inc.sourceIp,
          destinationIp: inc.destinationIp,
          asset: inc.asset,
          user: inc.user,
          mitreTechnique: mitre?.name,
          mitreTactic: mitre?.tactic,
          priorityScore: inc.priorityScore,
          stage,
        };
      });

      const primaryTarget = assets[0] || 'Infrastructure';
      const attackName = cluster.some((c) => c.type === 'Ransomware Activity')
        ? `Multi-Stage Ransomware Campaign on ${primaryTarget}`
        : cluster.some((c) => c.type === 'Data Exfiltration')
        ? `Coordinated Data Exfiltration Chain (${primaryTarget})`
        : cluster.some((c) => c.type === 'Privilege Escalation')
        ? `Domain Escalation & Credential Pivot (${users[0] || 'Unknown'})`
        : `Targeted Multi-Vector Intrusion (${srcIps[0] || 'External'})`;

      chains.push({
        id: chainId,
        name: attackName,
        threatActor: srcIps[0]?.startsWith('192.') || srcIps[0]?.startsWith('10.') ? 'Internal / Compromised Pivot' : 'Advanced Threat Group (APT)',
        confidence: Math.min(98, 70 + cluster.length * 7),
        status: 'ACTIVE',
        nodes,
        rootIncidentId: cluster[0].id,
        latestIncidentId: cluster[cluster.length - 1].id,
        entities: {
          sourceIps: srcIps,
          destinationIps: destIps,
          users,
          assets,
        },
      });
    }
  }

  return chains;
}

/**
 * Enhances all incidents by running the correlation engine and updating correlation factors
 */
export function correlateAllIncidents(incidents: Incident[]): {
  correlatedIncidents: Incident[];
  attackChains: AttackChain[];
} {
  const withCorrelation = incidents.map((inc) => {
    const { score, correlatedIds } = computeCorrelationScore(inc, incidents);
    return {
      ...inc,
      factors: {
        ...inc.factors,
        correlationScore: score,
      },
      correlatedIncidentIds: correlatedIds,
    };
  });

  const attackChains = buildAttackChains(withCorrelation);

  const finalIncidents = withCorrelation.map((inc) => {
    const matchedChain = attackChains.find((chain) =>
      chain.nodes.some((n) => n.incidentId === inc.id)
    );
    const node = matchedChain?.nodes.find((n) => n.incidentId === inc.id);

    return {
      ...inc,
      attackChainId: matchedChain?.id,
      attackChainStage: node?.stage || ATTACK_STAGE_MAP[inc.type],
    };
  });

  return {
    correlatedIncidents: finalIncidents,
    attackChains,
  };
}

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentStatus = 'NEW' | 'INVESTIGATING' | 'ESCALATED' | 'MITIGATED' | 'SUPPRESSED';

export type AttackCategory = 
  | 'Data Exfiltration'
  | 'Privilege Escalation'
  | 'Ransomware Activity'
  | 'Malware Detection'
  | 'Brute-Force Attack'
  | 'Failed Login Attempts'
  | 'Suspicious PowerShell'
  | 'Impossible Travel Login'
  | 'Suspicious Email / Phishing'
  | 'Port Scan & Recon'
  | 'C2 Communication'
  | 'Lateral Movement';

export interface ScoringFactors {
  severity: number;          // 1 - 10 (Weight: 22%)
  businessImpact: number;    // 1 - 10 (Weight: 18%)
  assetImportance: number;   // 1 - 10 (Weight: 15%)
  dataSensitivity: number;   // 1 - 10 (Weight: 15%)
  attackConfidence: number;  // 1 - 10 (Weight: 12%)
  affectedUsers: number;     // 1 - 10 (Weight: 8%)
  correlationScore: number;  // 1 - 10 (Weight: 10%)
}

export interface FactorWeights {
  severity: number;          // Default: 0.22
  businessImpact: number;    // Default: 0.18
  assetImportance: number;   // Default: 0.15
  dataSensitivity: number;   // Default: 0.15
  attackConfidence: number;  // Default: 0.12
  affectedUsers: number;     // Default: 0.08
  correlationScore: number;  // Default: 0.10
}

export interface FactorContribution {
  factor: keyof ScoringFactors;
  name: string;
  value: number;
  weight: number;
  contribution: number; // value * weight * 10
  percentage: number;
}

export interface AttackChainNode {
  id: string;
  incidentId: string;
  type: AttackCategory;
  timestamp: string;
  sourceIp: string;
  destinationIp: string;
  asset: string;
  user: string;
  mitreTechnique?: string;
  mitreTactic?: string;
  priorityScore: number;
  stage: 'Initial Access' | 'Execution' | 'Credential Access' | 'Privilege Escalation' | 'Lateral Movement' | 'Exfiltration' | 'Impact';
}

export interface AttackChain {
  id: string;
  name: string;
  threatActor?: string;
  confidence: number;
  status: 'ACTIVE' | 'CONTAINED' | 'MONITORING';
  nodes: AttackChainNode[];
  rootIncidentId: string;
  latestIncidentId: string;
  entities: {
    sourceIps: string[];
    destinationIps: string[];
    users: string[];
    assets: string[];
  };
}

export interface Incident {
  id: string;
  title: string;
  type: AttackCategory;
  description: string;
  factors: ScoringFactors;
  weightedScore: number;       // Raw weighted score (1.0 - 10.0)
  priorityScore: number;       // Scaled to 100
  riskLevel: RiskLevel;
  rank?: number;
  
  // Entity Attributes
  sourceIp: string;
  destinationIp: string;
  asset: string;
  assetTier: 'Tier 0 - Crown Jewels' | 'Tier 1 - Mission Critical' | 'Tier 2 - Business Operations' | 'Tier 3 - General Endpoint';
  user: string;
  userRole?: string;
  device?: string;
  
  // MITRE ATT&CK Info
  mitreId?: string;
  mitreTechnique?: string;
  mitreTactic?: string;

  // Correlation & Timeline
  timestamp: string;
  correlatedIncidentIds: string[];
  attackChainId?: string;
  attackChainStage?: AttackChainNode['stage'];
  
  // SOC Management
  status: IncidentStatus;
  assignee?: string;
  notes?: string[];
  recommendedActions: string[];
  mitigatedAt?: string;
  isNewAlert?: boolean;
}

export interface QueueFilters {
  searchQuery: string;
  riskLevels: RiskLevel[];
  statuses: IncidentStatus[];
  types: AttackCategory[];
  assetTier?: string;
  onlyCorrelated: boolean;
  sortBy: 'rank' | 'score' | 'time' | 'severity' | 'asset';
  sortOrder: 'asc' | 'desc';
}

export interface SOCMetrics {
  totalIncidents: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  activeAttackChains: number;
  affectedAssetsCount: number;
  avgPriorityScore: number;
  eventsPerSecond: number;
  mitigatedCount: number;
}

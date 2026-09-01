import { Incident } from '../types/incident';

const SUPABASE_URL = 'https://lenivohgxznlrsqghxrg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_dalRTRYrY1c2QE6pUBkvcg_d5613SEU';

type IncidentRow = {
  id: string;
  title: string;
  type: Incident['type'];
  description: string;
  severity: number;
  business_impact: number;
  asset_importance: number;
  data_sensitivity: number;
  attack_confidence: number;
  affected_users: number;
  correlation_score: number;
  weighted_score: number;
  priority_score: number;
  risk_level: Incident['riskLevel'];
  rank: number | null;
  source_ip: string;
  destination_ip: string;
  asset: string;
  asset_tier: Incident['assetTier'];
  user_name: string;
  user_role: string | null;
  device: string | null;
  mitre_id: string | null;
  mitre_technique: string | null;
  mitre_tactic: string | null;
  event_timestamp: string;
  correlated_incident_ids: string[];
  attack_chain_id: string | null;
  attack_chain_stage: Incident['attackChainStage'] | null;
  status: Incident['status'];
  assignee: string | null;
  notes: string[];
  recommended_actions: string[];
  mitigated_at: string | null;
  is_new_alert: boolean;
};

const mapRowToIncident = (row: IncidentRow): Incident => ({
  id: row.id,
  title: row.title,
  type: row.type,
  description: row.description,
  factors: {
    severity: Number(row.severity),
    businessImpact: Number(row.business_impact),
    assetImportance: Number(row.asset_importance),
    dataSensitivity: Number(row.data_sensitivity),
    attackConfidence: Number(row.attack_confidence),
    affectedUsers: Number(row.affected_users),
    correlationScore: Number(row.correlation_score),
  },
  weightedScore: Number(row.weighted_score),
  priorityScore: Number(row.priority_score),
  riskLevel: row.risk_level,
  rank: row.rank ?? undefined,
  sourceIp: row.source_ip,
  destinationIp: row.destination_ip,
  asset: row.asset,
  assetTier: row.asset_tier,
  user: row.user_name,
  userRole: row.user_role ?? undefined,
  device: row.device ?? undefined,
  mitreId: row.mitre_id ?? undefined,
  mitreTechnique: row.mitre_technique ?? undefined,
  mitreTactic: row.mitre_tactic ?? undefined,
  timestamp: row.event_timestamp,
  correlatedIncidentIds: row.correlated_incident_ids ?? [],
  attackChainId: row.attack_chain_id ?? undefined,
  attackChainStage: row.attack_chain_stage ?? undefined,
  status: row.status,
  assignee: row.assignee ?? undefined,
  notes: row.notes ?? [],
  recommendedActions: row.recommended_actions ?? [],
  mitigatedAt: row.mitigated_at ?? undefined,
  isNewAlert: row.is_new_alert,
});

export const loadIncidentsFromSupabase = async (): Promise<Incident[]> => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/incidents?select=*&order=event_timestamp.desc`,
    {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Supabase incident load failed (${response.status})`);
  }

  const rows = (await response.json()) as IncidentRow[];
  return rows.map(mapRowToIncident);
};

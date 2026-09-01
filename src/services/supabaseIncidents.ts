import { Incident, IncidentStatus } from '../types/incident';

const SUPABASE_URL = 'https://lenivohgxznlrsqghxrg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_dalRTRYrY1c2QE6pUBkvcg_d5613SEU';

const baseHeaders = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
  'Content-Type': 'application/json',
};

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

const mapIncidentToRow = (incident: Incident): IncidentRow => ({
  id: incident.id,
  title: incident.title,
  type: incident.type,
  description: incident.description,
  severity: incident.factors.severity,
  business_impact: incident.factors.businessImpact,
  asset_importance: incident.factors.assetImportance,
  data_sensitivity: incident.factors.dataSensitivity,
  attack_confidence: incident.factors.attackConfidence,
  affected_users: incident.factors.affectedUsers,
  correlation_score: incident.factors.correlationScore,
  weighted_score: incident.weightedScore,
  priority_score: incident.priorityScore,
  risk_level: incident.riskLevel,
  rank: incident.rank ?? null,
  source_ip: incident.sourceIp,
  destination_ip: incident.destinationIp,
  asset: incident.asset,
  asset_tier: incident.assetTier,
  user_name: incident.user,
  user_role: incident.userRole ?? null,
  device: incident.device ?? null,
  mitre_id: incident.mitreId ?? null,
  mitre_technique: incident.mitreTechnique ?? null,
  mitre_tactic: incident.mitreTactic ?? null,
  event_timestamp: incident.timestamp,
  correlated_incident_ids: incident.correlatedIncidentIds ?? [],
  attack_chain_id: incident.attackChainId ?? null,
  attack_chain_stage: incident.attackChainStage ?? null,
  status: incident.status,
  assignee: incident.assignee ?? null,
  notes: incident.notes ?? [],
  recommended_actions: incident.recommendedActions ?? [],
  mitigated_at: incident.mitigatedAt ?? null,
  is_new_alert: Boolean(incident.isNewAlert),
});

const ensureOk = async (response: Response, action: string) => {
  if (response.ok) return;
  const detail = await response.text().catch(() => '');
  throw new Error(`${action} failed (${response.status})${detail ? `: ${detail}` : ''}`);
};

export const loadIncidentsFromSupabase = async (): Promise<Incident[]> => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/incidents?select=*&order=event_timestamp.desc`,
    { headers: baseHeaders }
  );

  await ensureOk(response, 'Supabase incident load');
  const rows = (await response.json()) as IncidentRow[];
  return rows.map(mapRowToIncident);
};

export const upsertIncidentToSupabase = async (incident: Incident): Promise<void> => {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/incidents?on_conflict=id`, {
    method: 'POST',
    headers: {
      ...baseHeaders,
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(mapIncidentToRow(incident)),
  });
  await ensureOk(response, 'Supabase incident save');
};

export const upsertIncidentsToSupabase = async (incidents: Incident[]): Promise<void> => {
  if (incidents.length === 0) return;
  const response = await fetch(`${SUPABASE_URL}/rest/v1/incidents?on_conflict=id`, {
    method: 'POST',
    headers: {
      ...baseHeaders,
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(incidents.map(mapIncidentToRow)),
  });
  await ensureOk(response, 'Supabase incident batch save');
};

export const updateIncidentStatusInSupabase = async (
  id: string,
  status: IncidentStatus,
  notes: string[],
  mitigatedAt?: string
): Promise<void> => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/incidents?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { ...baseHeaders, Prefer: 'return=minimal' },
      body: JSON.stringify({
        status,
        notes,
        mitigated_at: mitigatedAt ?? null,
      }),
    }
  );
  await ensureOk(response, 'Supabase incident status update');
};

export const deleteIncidentFromSupabase = async (id: string): Promise<void> => {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/incidents?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: { ...baseHeaders, Prefer: 'return=minimal' },
    }
  );
  await ensureOk(response, 'Supabase incident delete');
};

const SUPABASE_URL = 'https://lenivohgxznlrsqghxrg.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_dalRTRYrY1c2QE6pUBkvcg_d5613SEU';

const headers = {
  apikey: SUPABASE_PUBLISHABLE_KEY,
  Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
};

export type IncidentAuditEntry = {
  id: number;
  incident_id: string | null;
  action: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'DELETED';
  previous_status: string | null;
  new_status: string | null;
  changed_fields: Record<string, unknown>;
  actor_id: string | null;
  created_at: string;
};

export async function loadIncidentAuditHistory(incidentId: string): Promise<IncidentAuditEntry[]> {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/incident_audit_log?incident_id=eq.${encodeURIComponent(incidentId)}&select=*&order=created_at.desc&limit=25`,
    { headers }
  );

  if (!response.ok) {
    throw new Error(`Incident audit history load failed (${response.status})`);
  }

  return (await response.json()) as IncidentAuditEntry[];
}

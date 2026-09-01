import type { FactorWeights, Incident } from '../types/incident';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isDatabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const headers = () => ({
  apikey: supabaseAnonKey ?? '',
  Authorization: `Bearer ${supabaseAnonKey ?? ''}`,
  'Content-Type': 'application/json',
});

const assertConfigured = () => {
  if (!isDatabaseConfigured || !supabaseUrl) {
    throw new Error('Supabase database is not configured');
  }
};

export async function loadIncidentsFromDatabase(): Promise<Incident[]> {
  assertConfigured();

  const response = await fetch(
    `${supabaseUrl}/rest/v1/incidents?select=payload&order=timestamp.desc`,
    { headers: headers() }
  );

  if (!response.ok) {
    throw new Error(`Failed to load incidents (${response.status})`);
  }

  const rows = (await response.json()) as Array<{ payload: Incident }>;
  return rows.map((row) => row.payload).filter(Boolean);
}

export async function replaceIncidentsInDatabase(incidents: Incident[]): Promise<void> {
  assertConfigured();

  const deleteResponse = await fetch(`${supabaseUrl}/rest/v1/incidents?id=not.is.null`, {
    method: 'DELETE',
    headers: headers(),
  });

  if (!deleteResponse.ok) {
    throw new Error(`Failed to sync incidents (${deleteResponse.status})`);
  }

  if (incidents.length === 0) return;

  const rows = incidents.map((incident) => ({
    id: incident.id,
    type: incident.type,
    title: incident.title,
    priority_score: incident.priorityScore,
    risk_level: incident.riskLevel,
    status: incident.status,
    timestamp: incident.timestamp,
    source_ip: incident.sourceIp,
    asset: incident.asset,
    payload: incident,
    updated_at: new Date().toISOString(),
  }));

  const insertResponse = await fetch(`${supabaseUrl}/rest/v1/incidents`, {
    method: 'POST',
    headers: {
      ...headers(),
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(rows),
  });

  if (!insertResponse.ok) {
    throw new Error(`Failed to save incidents (${insertResponse.status})`);
  }
}

export async function loadWeightsFromDatabase(): Promise<FactorWeights | null> {
  assertConfigured();

  const response = await fetch(
    `${supabaseUrl}/rest/v1/soc_settings?select=weights&id=eq.default&limit=1`,
    { headers: headers() }
  );

  if (!response.ok) {
    throw new Error(`Failed to load scoring weights (${response.status})`);
  }

  const rows = (await response.json()) as Array<{ weights: FactorWeights }>;
  return rows[0]?.weights ?? null;
}

export async function saveWeightsToDatabase(weights: FactorWeights): Promise<void> {
  assertConfigured();

  const response = await fetch(`${supabaseUrl}/rest/v1/soc_settings?on_conflict=id`, {
    method: 'POST',
    headers: {
      ...headers(),
      Prefer: 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify({
      id: 'default',
      weights,
      updated_at: new Date().toISOString(),
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to save scoring weights (${response.status})`);
  }
}

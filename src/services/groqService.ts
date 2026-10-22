export interface IncidentData {
  title?: string;
  description?: string;
  severity?: string;
  assetImportance?: string;
  dataSensitivity?: string;
  attackConfidence?: number;
  affectedUsers?: number;
  businessImpact?: string;
}

export interface AIAnalysisResult {
  verdict: string;
  confidence: number;
  threatType: string;
  explanation: string;
  evidence: string[];
  recommendedActions: string[];
}

function getAnalysisEndpoint(): string {
  const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');

  if (configuredBase) {
    return `${configuredBase}/api/analyze-incident`;
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:5000/api/analyze-incident';
  }

  throw new Error(
    'AI analysis is not configured for this deployment. Set VITE_API_BASE_URL to the deployed backend origin.'
  );
}

export async function analyzeIncident(
  incident: IncidentData
): Promise<AIAnalysisResult> {
  const response = await fetch(getAnalysisEndpoint(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(incident)
  });

  if (!response.ok) {
    throw new Error(`Incident analysis failed (HTTP ${response.status})`);
  }

  return response.json() as Promise<AIAnalysisResult>;
}

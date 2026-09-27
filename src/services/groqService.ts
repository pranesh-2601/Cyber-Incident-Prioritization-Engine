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

export async function analyzeIncident(
  incident: IncidentData
): Promise<AIAnalysisResult> {
  const response = await fetch("http://localhost:5000/api/analyze-incident", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(incident)
  });

  if (!response.ok) {
    throw new Error("Incident analysis failed");
  }

  return response.json();
}
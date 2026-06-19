const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface PredictRequest {
  temperature: number;
  fat: number;
  snf: number;
  protein: number;
  lactose: number;
  salt: number;
  total_solid: number;
  density: number;
  added_water: number;
  freezing_point: number;
  ph: number;
  alcohol_test: number;
  peroxide_test: number;
  taste_score: number;
  aroma_score: number;
  texture_score: number;
}

export interface ShapFeature {
  feature: string;
  shap_value: number;
}

export interface PredictResponse {
  predicted_grade: string;
  confidence: number;
  probabilities: Record<string, number>;
  top_features: ShapFeature[];
  recommendation: string;
}

export interface HealthResponse {
  status: string;
  model_loaded: boolean;
  model_type: string | null;
}

export async function predict(
  data: PredictRequest
): Promise<PredictResponse> {
  const res = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = Array.isArray(err.detail)
      ? err.detail.map((d: any) => d.msg || JSON.stringify(d)).join("; ")
      : err.detail || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return res.json();
}

export async function healthCheck(): Promise<HealthResponse> {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error(`Health check failed: ${res.status}`);
  return res.json();
}

export const GRADE_COLORS: Record<string, string> = {
  A: "bg-grade-a",
  B: "bg-grade-b",
  C: "bg-grade-c",
  Reject: "bg-grade-reject",
};

export const GRADE_TEXT_COLORS: Record<string, string> = {
  A: "text-grade-a",
  B: "text-grade-b",
  C: "text-grade-c",
  Reject: "text-grade-reject",
};

export const GRADE_BG_LIGHT: Record<string, string> = {
  A: "bg-green-900/20 border-green-500/30",
  B: "bg-blue-900/20 border-blue-500/30",
  C: "bg-amber-900/20 border-amber-500/30",
  Reject: "bg-red-900/20 border-red-500/30",
};

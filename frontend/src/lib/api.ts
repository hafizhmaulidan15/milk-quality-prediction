const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface PredictRequest {
  temperature: number;
  fat: number;
  snf: number;
  protein: number;
  lactose: number;
  total_solid: number;
  density: number;
  freezing_point: number;
  added_water: number;
  ph: number;
  alcohol_test: number;
  peroxide_test: number;
  taste_score: number;
  aroma_score: number;
  texture_score: number;
  pasteurization_temp?: number;
  storage_temp?: number;
  storage_time?: number;
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
    throw new Error(err.detail || `HTTP ${res.status}`);
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
  A: "bg-green-50 border-green-200",
  B: "bg-blue-50 border-blue-200",
  C: "bg-amber-50 border-amber-200",
  Reject: "bg-red-50 border-red-200",
};

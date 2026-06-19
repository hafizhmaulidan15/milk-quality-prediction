import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder"
);

export interface PredictionRecord {
  id: string;
  created_at: string;
  grade: string;
  confidence: number;
  probabilities: Record<string, number>;
  top_features: { feature: string; shap_value: number }[];
  recommendation: string;
  input_data: Record<string, number>;
}

export async function savePrediction(
  grade: string,
  confidence: number,
  probabilities: Record<string, number>,
  top_features: { feature: string; shap_value: number }[],
  recommendation: string,
  input_data: Record<string, number>
) {
  if (!supabaseUrl) return;
  const { error } = await supabase.from("predictions").insert({
    grade,
    confidence,
    probabilities,
    top_features,
    recommendation,
    input_data,
  });
  if (error) throw error;
}

export async function getPredictions(limit = 100) {
  if (!supabaseUrl) return [];
  const { data, error } = await supabase
    .from("predictions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as PredictionRecord[];
}

export async function deleteAllPredictions() {
  if (!supabaseUrl) return;
  const { error } = await supabase.from("predictions").delete().neq("id", "");
  if (error) throw error;
}

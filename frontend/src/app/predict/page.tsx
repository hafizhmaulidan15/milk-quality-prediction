"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { predict, type PredictRequest, type PredictResponse } from "@/lib/api";
import { savePrediction } from "@/lib/supabase";
import PredictionResult from "@/components/PredictionResult";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { FlaskConical, RotateCcw, AlertCircle, Milk, Scale, Eye, Sparkles, AlertTriangle } from "lucide-react";

const defaultForm: PredictRequest = {
  temperature: 5,
  fat: 4.0,
  snf: 8.8,
  protein: 3.2,
  lactose: 4.7,
  salt: 0.15,
  total_solid: 12.8,
  density: 1.030,
  added_water: 0,
  freezing_point: -0.540,
  ph: 6.7,
  alcohol_test: 0,
  peroxide_test: 0,
  taste_score: 4,
  aroma_score: 4,
  texture_score: 4,
};

interface FieldMeta {
  label: string;
  unit: string;
  placeholder?: string;
  section: "lactosan" | "organoleptik" | "lainnya";
  min?: number;
  max?: number;
  warning?: string;
}

function getWarning(field: string, value: number, meta: FieldMeta): string | null {
  if (meta.min !== undefined && value < meta.min) return `Terlalu rendah (min ${meta.min})`;
  if (meta.max !== undefined && value > meta.max) return `Terlalu tinggi (max ${meta.max})`;
  return null;
}

const fields: Record<string, FieldMeta> = {
  temperature: { label: "Suhu Pengecekan", unit: "°C", min: 2, max: 10, section: "lactosan" },
  fat: { label: "Lemak", unit: "%", min: 2, max: 7, section: "lactosan" },
  snf: { label: "Solid Non Fat", unit: "%", min: 7, max: 10, section: "lactosan" },
  protein: { label: "Protein", unit: "%", min: 2.5, max: 4.5, section: "lactosan" },
  lactose: { label: "Laktosa", unit: "%", min: 3.5, max: 5.5, section: "lactosan" },
  salt: { label: "Garam", unit: "%", min: 0.05, max: 0.25, section: "lactosan" },
  total_solid: { label: "Total Solid", unit: "%", min: 10, max: 15, section: "lactosan" },
  density: { label: "Density", unit: "g/mL", min: 1.025, max: 1.035, section: "lactosan" },
  added_water: { label: "Air Tambahan", unit: "%", min: 0, max: 10, section: "lactosan" },
  freezing_point: { label: "Titik Beku", unit: "°C", min: -0.57, max: -0.51, section: "lactosan" },
  ph: { label: "pH", unit: "", min: 6, max: 7, section: "lainnya" },
  alcohol_test: { label: "Tes Alkohol 70%", unit: "", section: "lainnya" },
  peroxide_test: { label: "Tes Peroksida", unit: "", section: "lainnya" },
  taste_score: { label: "Rasa", unit: "", min: 1, max: 5, section: "organoleptik" },
  aroma_score: { label: "Aroma", unit: "", min: 1, max: 5, section: "organoleptik" },
  texture_score: { label: "Tekstur", unit: "", min: 1, max: 5, section: "organoleptik" },
};

export default function PredictPage() {
  const [form, setForm] = useState<PredictRequest>(defaultForm);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inputStr, setInputStr] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const k of Object.keys(defaultForm)) {
      init[k] = String((defaultForm as any)[k]);
    }
    return init;
  });

  const updateField = useCallback((field: string, raw: string) => {
    const normalized = raw.replace(",", ".");
    if (field === "alcohol_test" || field === "peroxide_test") {
      const v = raw === "1" ? 1 : 0;
      setForm((prev) => ({ ...prev, [field]: v }));
      setInputStr((prev) => ({ ...prev, [field]: raw }));
      return;
    }
    if (field === "taste_score" || field === "aroma_score" || field === "texture_score") {
      const v = parseInt(normalized) || 1;
      setForm((prev) => ({ ...prev, [field]: v }));
      setInputStr((prev) => ({ ...prev, [field]: raw }));
      return;
    }
    setInputStr((prev) => ({ ...prev, [field]: raw }));
    const num = parseFloat(normalized);
    if (!isNaN(num)) {
      setForm((prev) => ({ ...prev, [field]: num }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await predict(form);
      setResult(res);
      savePrediction(
        res.predicted_grade, res.confidence, res.probabilities,
        res.top_features, res.recommendation, form as unknown as Record<string, number>
      ).catch(() => {});
      toast.success("Prediksi berhasil!", { duration: 3000 });
    } catch (err: any) {
      const msg = err.message || "Prediksi gagal. Periksa koneksi API.";
      setError(msg);
      toast.error(msg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const renderNumberInput = (field: string) => {
    const meta = fields[field];
    const val = form[field as keyof PredictRequest] as number;
    const warn = getWarning(field, val, meta);
    return (
      <div key={field}>
        <label className="flex items-center gap-1 text-sm font-medium text-gray-300 mb-1">
          {meta.label}
          {meta.unit && <span className="text-gray-500">({meta.unit})</span>}
          {warn && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
        </label>
        <input
          type="text"
          inputMode="decimal"
          value={inputStr[field] || ""}
          onChange={(e) => updateField(field, e.target.value)}
          className={`hide-spinner w-full px-3 py-2.5 rounded-xl focus:ring-2 focus:border-blue-500 outline-none transition-shadow ${
            warn ? "glass border-amber-500/40 focus:ring-amber-500" : "glass focus:ring-blue-500"
          }`}
        />
        {warn && <p className="text-[10px] text-amber-400 mt-0.5">{warn}</p>}
      </div>
    );
  };

  const renderBinaryField = (field: string) => {
    const meta = fields[field];
    const val = form[field as keyof PredictRequest] as number;
    const isBad = val === 1;
    return (
      <div key={field}>
        <label className="flex items-center gap-1 text-sm font-medium text-gray-300 mb-1.5">
          {meta.label}
          {isBad && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
        </label>
        <div className="flex gap-2">
          {[{ label: "Negatif ✅", value: 0 }, { label: "Positif ❌", value: 1 }].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateField(field, String(opt.value))}
              className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                val === opt.value
                  ? "glass text-blue-400 shadow-sm"
                  : "glass text-gray-400 hover:bg-white/5"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderScoreField = (field: string) => {
    const meta = fields[field];
    const val = form[field as keyof PredictRequest] as number;
    const isLow = val <= 2;
    return (
      <div key={field}>
        <label className="flex items-center gap-1 text-sm font-medium text-gray-300 mb-1.5">
          {meta.label} (1-5)
          {isLow && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
        </label>
        <div className="flex gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => updateField(field, String(n))}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                val === n
                  ? "glass text-blue-400 shadow-sm"
                  : "glass text-gray-400 hover:bg-white/5"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderField = (field: string) => {
    if (field === "alcohol_test" || field === "peroxide_test") return renderBinaryField(field);
    if (field === "taste_score" || field === "aroma_score" || field === "texture_score") return renderScoreField(field);
    return renderNumberInput(field);
  };

  const lactosanFields = Object.keys(fields).filter((f) => fields[f].section === "lactosan");
  const organoleptikFields = Object.keys(fields).filter((f) => fields[f].section === "organoleptik");
  const lainnyaFields = Object.keys(fields).filter((f) => fields[f].section === "lainnya");

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 glass rounded-full text-xs font-medium text-blue-400">
          <Sparkles className="w-3.5 h-3.5" /> Parameter Uji Susu
        </div>
        <h1 className="text-3xl font-bold text-white">Prediksi Kualitas Susu</h1>
        <p className="text-gray-400 mt-1">
          Masukkan parameter produksi untuk memprediksi grade susu pasteurisasi secara real-time.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <form onSubmit={handleSubmit} className="xl:col-span-3 space-y-6 glass-dark p-6 rounded-2xl shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Scale className="w-5 h-5 text-blue-400" />
              <h2 className="font-semibold text-white">Hasil Lactosan</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {lactosanFields.map(renderField)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Eye className="w-5 h-5 text-green-400" />
              <h2 className="font-semibold text-white">Tes Organoleptik</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
              {organoleptikFields.map(renderField)}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Milk className="w-5 h-5 text-purple-400" />
              <h2 className="font-semibold text-white">Tes Lainnya</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {lainnyaFields.map(renderField)}
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-start gap-3 p-3 glass border-red-500/20 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-400">Gagal memproses prediksi</p>
                <p className="text-xs text-red-400 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-xl font-semibold hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                  Memproses...
                </>
              ) : (
                <><FlaskConical className="w-5 h-5" /> Prediksi Sekarang</>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setForm(defaultForm);
                setError(null);
                const init: Record<string, string> = {};
                for (const k of Object.keys(defaultForm)) {
                  init[k] = String((defaultForm as any)[k]);
                }
                setInputStr(init);
              }}
              className="px-6 py-3 glass rounded-xl font-medium text-gray-400 hover:bg-white/5 transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
          </div>
        </form>

        <div className="xl:col-span-2">
          <AnimatePresence mode="wait">
            {loading && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingSkeleton />
              </motion.div>
            )}
            {result && !loading && (
              <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
                <PredictionResult result={result} onReset={() => setResult(null)} />
              </motion.div>
            )}
            {!result && !loading && (
              <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full min-h-[400px] glass rounded-2xl border-2 border-dashed border-white/10 p-8 text-center">
                <FlaskConical className="w-16 h-16 text-blue-400 mb-4" />
                <p className="text-gray-400 text-lg font-medium">Hasil prediksi akan muncul di sini</p>
                <p className="text-gray-500 text-sm mt-1">Isi parameter produksi dan klik &ldquo;Prediksi Sekarang&rdquo;</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

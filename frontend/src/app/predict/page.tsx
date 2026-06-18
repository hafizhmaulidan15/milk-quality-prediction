"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { predict, type PredictRequest, type PredictResponse } from "@/lib/api";
import PredictionResult from "@/components/PredictionResult";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { FlaskConical, RotateCcw, AlertCircle, Milk, Thermometer } from "lucide-react";

const defaultForm: PredictRequest = {
  temperature: 5,
  fat: 4.0,
  snf: 8.8,
  protein: 3.2,
  lactose: 4.7,
  total_solid: 12.8,
  density: 1.030,
  freezing_point: -0.540,
  added_water: 0,
  ph: 6.7,
  alcohol_test: 0,
  peroxide_test: 0,
  taste_score: 4,
  aroma_score: 4,
  texture_score: 4,
  pasteurization_temp: 72,
  storage_temp: 4.5,
  storage_time: 12,
};

interface FieldMeta {
  label: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  section: "raw" | "post";
  help?: string;
}

const fieldMeta: Record<string, FieldMeta> = {
  temperature: { label: "Suhu Pengecekan", unit: "°C", min: 0, max: 15, step: 0.1, section: "raw" },
  fat: { label: "Lemak (Fat)", unit: "%", min: 1, max: 8, step: 0.1, section: "raw" },
  snf: { label: "Solid Non Fat", unit: "%", min: 7, max: 11, step: 0.1, section: "raw" },
  protein: { label: "Protein", unit: "%", min: 2, max: 5, step: 0.01, section: "raw" },
  lactose: { label: "Laktosa", unit: "%", min: 3, max: 6, step: 0.1, section: "raw" },
  total_solid: { label: "Total Solid", unit: "%", min: 10, max: 18, step: 0.1, section: "raw" },
  density: { label: "Density", unit: "g/mL", min: 1.020, max: 1.040, step: 0.001, section: "raw" },
  freezing_point: { label: "Titik Beku", unit: "°C", min: -0.600, max: -0.500, step: 0.001, section: "raw", help: "Normal: -0.520 sd -0.550" },
  added_water: { label: "Air Tambahan", unit: "%", min: 0, max: 15, step: 0.1, section: "raw" },
  ph: { label: "pH", unit: "", min: 6, max: 7.5, step: 0.01, section: "raw", help: "Normal: 6.6-6.8" },
  taste_score: { label: "Rasa (1-5)", unit: "", min: 1, max: 5, step: 1, section: "raw" },
  aroma_score: { label: "Aroma (1-5)", unit: "", min: 1, max: 5, step: 1, section: "raw" },
  texture_score: { label: "Tekstur (1-5)", unit: "", min: 1, max: 5, step: 1, section: "raw" },
  pasteurization_temp: { label: "Suhu Pasteurisasi", unit: "°C", min: 60, max: 95, step: 0.1, section: "post", help: "Opsional - isi setelah pasteurisasi" },
  storage_temp: { label: "Suhu Penyimpanan", unit: "°C", min: 0, max: 15, step: 0.1, section: "post", help: "Opsional" },
  storage_time: { label: "Waktu Simpan", unit: "jam", min: 0, max: 168, step: 0.5, section: "post", help: "Opsional" },
};

const binaryOptions = [
  { label: "Tidak Pecah ✅", value: 0 },
  { label: "Pecah ❌", value: 1 },
];

export default function PredictPage() {
  const [form, setForm] = useState<PredictRequest>(defaultForm);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = useCallback((field: string, raw: string | number) => {
    setForm((prev) => ({ ...prev, [field]: typeof raw === "string" && !isNaN(Number(raw)) ? Number(raw) : raw }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await predict(form);
      setResult(res);
      toast.success("Prediksi berhasil!", { duration: 3000 });
    } catch (err: any) {
      const msg = err.message || "Prediksi gagal. Periksa koneksi API.";
      setError(msg);
      toast.error(msg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: string) => {
    const meta = fieldMeta[field];
    if (!meta) return null;

    if (field === "alcohol_test" || field === "peroxide_test") {
      return (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 capitalize">
            {meta.label}
          </label>
          <div className="flex gap-2">
            {binaryOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateField(field, opt.value)}
                className={`flex-1 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  form[field as keyof PredictRequest] === opt.value
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (field === "taste_score" || field === "aroma_score" || field === "texture_score") {
      const val = form[field as keyof PredictRequest] as number;
      return (
        <div key={field}>
          <label className="block text-sm font-medium text-gray-700 mb-1.5 capitalize">{meta.label}</label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => updateField(field, n)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                  val === n
                    ? "bg-blue-100 border-blue-300 text-blue-700"
                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      );
    }

    const val = (form[field as keyof PredictRequest] as number) || 0;
    const pct = ((val - meta.min) / (meta.max - meta.min)) * 100;

    return (
      <div key={field}>
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700">{meta.label}</label>
          <span className="text-xs font-mono font-bold text-blue-600">{val} {meta.unit}</span>
        </div>
        <input
          type="range"
          min={meta.min}
          max={meta.max}
          step={meta.step}
          value={val}
          onChange={(e) => updateField(field, e.target.value)}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
          <span>{meta.min}</span>
          {meta.help && <span className="text-gray-500">{meta.help}</span>}
          <span>{meta.max}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">Prediksi Kualitas Susu</h1>
        <p className="text-gray-500 mt-1">
          Masukkan parameter uji susu mentah dan pasteurisasi untuk prediksi grade.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <form onSubmit={handleSubmit} className="xl:col-span-3 space-y-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Milk className="w-5 h-5 text-blue-600" />
              <h2 className="font-semibold text-gray-900">Uji Susu Mentah</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {Object.entries(fieldMeta)
                .filter(([, m]) => m.section === "raw")
                .map(([field]) => renderField(field))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
              <Thermometer className="w-5 h-5 text-indigo-600" />
              <h2 className="font-semibold text-gray-900">Setelah Pasteurisasi <span className="text-xs text-gray-400 font-normal">(opsional)</span></h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
              {Object.entries(fieldMeta)
                .filter(([, m]) => m.section === "post")
                .map(([field]) => renderField(field))}
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Gagal memproses prediksi</p>
                <p className="text-xs text-red-600 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
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
              onClick={() => { setForm(defaultForm); setError(null); }}
              className="px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2"
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
              <motion.div key="placeholder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl border-2 border-dashed border-gray-300 p-8 text-center">
                <FlaskConical className="w-16 h-16 text-blue-300 mb-4" />
                <p className="text-gray-500 text-lg font-medium">Hasil prediksi akan muncul di sini</p>
                <p className="text-gray-400 text-sm mt-1">Isi parameter uji susu dan klik &ldquo;Prediksi Sekarang&rdquo;</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

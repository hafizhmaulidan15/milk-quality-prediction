"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { predict, type PredictRequest, type PredictResponse } from "@/lib/api";
import PredictionResult from "@/components/PredictionResult";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import { FlaskConical, RotateCcw, AlertCircle } from "lucide-react";

const defaultForm: PredictRequest = {
  storage_temp: 5,
  ph: 6.7,
  storage_time: 12,
  pasteurization_temp: 72,
  tpc: 50000,
  grading_delta_hours: 2,
  shift: "Pagi",
};

const shifts = ["Pagi", "Siang", "Malam"];

const fieldMeta: Record<
  keyof PredictRequest,
  { label: string; unit: string; min: number; max: number; step: number; required: boolean; desc: string }
> = {
  storage_temp: { label: "Suhu Penyimpanan", unit: "°C", min: -5, max: 20, step: 0.1, required: true, desc: "Ideal: 2-6°C" },
  ph: { label: "pH Susu", unit: "", min: 0, max: 14, step: 0.01, required: true, desc: "Ideal: 6.6-6.8" },
  storage_time: { label: "Waktu Simpan", unit: "jam", min: 0, max: 168, step: 0.5, required: true, desc: "Ideal: <24 jam" },
  pasteurization_temp: { label: "Suhu Pasteurisasi", unit: "°C", min: 50, max: 100, step: 0.1, required: true, desc: "Ideal: 70-75°C" },
  tpc: { label: "Total Plate Count", unit: "CFU/mL", min: 0, max: 5000000, step: 1000, required: false, desc: "Ideal: <50.000" },
  grading_delta_hours: { label: "Delta Grading", unit: "jam", min: 0, max: 72, step: 0.5, required: false, desc: "Ideal: <2 jam" },
  shift: { label: "Shift Produksi", unit: "", min: 0, max: 0, step: 0, required: false, desc: "" },
};

export default function PredictPage() {
  const [form, setForm] = useState<PredictRequest>(defaultForm);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateField = useCallback((field: keyof PredictRequest, raw: string) => {
    const meta = fieldMeta[field];
    if (field === "shift") {
      setForm((prev) => ({ ...prev, shift: raw }));
      return;
    }
    let val = meta.step >= 1 ? parseInt(raw) || 0 : parseFloat(raw) || 0;
    if (raw === "") val = 0;
    setForm((prev) => ({ ...prev, [field]: val }));
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

  const getRangeColor = (field: keyof PredictRequest, val: number) => {
    const m = fieldMeta[field];
    if (!m.required) return "";
    const mid = (m.min + m.max) / 2;
    const pct = Math.abs(val - mid) / ((m.max - m.min) / 2);
    if (pct < 0.3) return "text-green-600";
    if (pct < 0.6) return "text-amber-600";
    return "text-red-600";
  };

  const getRangeBg = (field: keyof PredictRequest, val: number) => {
    const m = fieldMeta[field];
    if (!m.required) return "bg-blue-500";
    const mid = (m.min + m.max) / 2;
    const pct = Math.abs(val - mid) / ((m.max - m.min) / 2);
    if (pct < 0.3) return "bg-green-500";
    if (pct < 0.6) return "bg-amber-500";
    return "bg-red-500";
  };

  const rangePct = (field: keyof PredictRequest, val: number) => {
    const m = fieldMeta[field];
    return ((val - m.min) / (m.max - m.min)) * 100;
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900">Prediksi Kualitas Susu</h1>
        <p className="text-gray-500 mt-1">
          Masukkan parameter produksi untuk memprediksi grade susu pasteurisasi secara real-time.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <form onSubmit={handleSubmit} className="xl:col-span-3 space-y-5 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            {(Object.keys(fieldMeta) as Array<keyof PredictRequest>).map((field) => {
              const meta = fieldMeta[field];
              if (field === "shift") {
                return (
                  <div key={field}>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Shift Produksi</label>
                    <select
                      value={form.shift}
                      onChange={(e) => updateField(field, e.target.value)}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white transition-shadow"
                    >
                      {shifts.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                  </div>
                );
              }
              const val = (form[field] as number) || 0;
              return (
                <div key={field}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700">
                      {meta.label}
                      {meta.required && <span className="text-red-400 ml-0.5">*</span>}
                    </label>
                    <span className={`text-xs font-mono font-bold ${getRangeColor(field, val)}`}>
                      {val} {meta.unit}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type="range"
                      min={meta.min}
                      max={meta.max}
                      step={meta.step}
                      value={val}
                      onChange={(e) => updateField(field, e.target.value)}
                      className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
                    <span>{meta.min}</span>
                    <span className="text-gray-500">{meta.desc}</span>
                    <span>{meta.max}</span>
                  </div>
                </div>
              );
            })}
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
                <p className="text-gray-400 text-sm mt-1">Isi parameter produksi dan klik &ldquo;Prediksi Sekarang&rdquo;</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

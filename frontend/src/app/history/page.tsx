"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GRADE_BG_LIGHT } from "@/lib/api";
import { Clock, Trash2, BarChart3, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { getPredictions, deleteAllPredictions, type PredictionRecord } from "@/lib/supabase";

type HistoryItem = PredictionRecord;

const gradeNumMap: Record<number, string> = { 1: "Reject", 2: "C", 3: "B", 4: "A" };

const gradeBarColors: Record<string, string> = {
  A: "#22c55e",
  B: "#3b82f6",
  C: "#f59e0b",
  Reject: "#ef4444",
};

export default function HistoryPage() {
  const [items, setItems] = useState<PredictionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFromSupabase();
  }, []);

  const loadFromSupabase = async () => {
    setLoading(true);
    try {
      const data = await getPredictions(100);
      setItems(data);
    } catch {
      setItems([]);
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    await deleteAllPredictions();
    setItems([]);
  };

  const gradeDist = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.grade] = (acc[item.grade] || 0) + 1;
    return acc;
  }, {});

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString("id-ID");
    } catch {
      return iso;
    }
  };

  const chartData = Object.entries(gradeDist).map(([name, count]) => ({ name, count }));

  const totalGradeA = items.filter((i) => i.grade === "A").length;
  const totalReject = items.filter((i) => i.grade === "Reject").length;
  const avgConf =
    items.length > 0
      ? items.reduce((sum, i) => sum + i.confidence, 0) / items.length
      : 0;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Riwayat Prediksi</h1>
          <p className="text-gray-400 mt-1">Semua prediksi disimpan di cloud.</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 glass hover:bg-white/5 rounded-xl transition-all"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Semua
          </button>
        )}
      </motion.div>

      {items.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="glass-dark p-4 rounded-xl">
            <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Total Prediksi</p>
            <p className="text-2xl font-bold text-white mt-1">{items.length}</p>
          </div>
          <div className="glass-dark p-4 rounded-xl border border-green-500/20">
            <p className="text-xs text-green-400 uppercase tracking-wider font-medium">Grade A</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{totalGradeA}</p>
          </div>
          <div className="glass-dark p-4 rounded-xl border border-red-500/20">
            <p className="text-xs text-red-400 uppercase tracking-wider font-medium">Reject</p>
            <p className="text-2xl font-bold text-red-400 mt-1">{totalReject}</p>
          </div>
          <div className="glass-dark p-4 rounded-xl border border-blue-500/20">
            <p className="text-xs text-blue-400 uppercase tracking-wider font-medium">Rata-rata Confidence</p>
            <p className="text-2xl font-bold text-blue-400 mt-1">{(avgConf * 100).toFixed(1)}%</p>
          </div>
        </motion.div>
      )}

      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-dark p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Distribusi Grade</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: "#9ca3af", fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(20,20,40,0.95)", backdropFilter: "blur(12px)" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={48}>
                  {chartData.map((entry) => (
                    <rect key={entry.name} fill={gradeBarColors[entry.name] || "#999"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {items.length >= 3 && (() => {
        const gradeNum: Record<string, number> = { Reject: 1, C: 2, B: 3, A: 4 };
        const trendData = [...items].reverse().map((it) => ({
          label: new Date(it.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
          value: gradeNum[it.grade] || 0,
          grade: it.grade,
        }));
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-dark p-6 rounded-2xl">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              <h3 className="font-semibold text-white">Tren Grade</h3>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis domain={[0.5, 4.5]} ticks={[1, 2, 3, 4]} tickFormatter={(v: number) => gradeNumMap[v] || ""} tick={{ fill: "#9ca3af", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(20,20,40,0.95)", backdropFilter: "blur(12px)" }} labelFormatter={(l) => `Tanggal: ${l}`} formatter={(v: number) => [gradeNumMap[v] || v, "Grade"]} />
                  <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4, fill: "#3b82f6" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        );
      })()}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <Loader2 className="w-12 h-12 mb-4 animate-spin opacity-50" />
          <p className="text-lg font-medium text-gray-400">Memuat riwayat...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-500">
          <Clock className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg font-medium text-gray-400">Belum ada riwayat prediksi</p>
          <p className="text-sm mt-1 text-gray-500">Lakukan prediksi melalui halaman Prediksi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: Math.min(idx * 0.03, 0.5) }}
              className={`p-4 rounded-xl glass-dark ${GRADE_BG_LIGHT[item.grade] || ""}`}
            >
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${item.grade === "A" ? "bg-grade-a" : item.grade === "B" ? "bg-grade-b" : item.grade === "C" ? "bg-grade-c" : "bg-grade-reject"}`}>
                    {item.grade}
                  </span>
                  <span className="text-sm text-gray-400">
                    Confidence: <strong>{(item.confidence * 100).toFixed(1)}%</strong>
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(item.created_at)}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(item.input_data || {}).map(([key, val]) =>
                  val ? (
                    <span key={key} className="text-[11px] glass px-2 py-1 rounded-md text-gray-300">
                      {key.replace(/_/g, " ")}: {typeof val === "number" ? val.toLocaleString() : String(val)}
                    </span>
                  ) : null
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

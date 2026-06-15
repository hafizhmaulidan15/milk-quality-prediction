"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GRADE_COLORS, GRADE_BG_LIGHT } from "@/lib/api";
import { Clock, Trash2, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface HistoryItem {
  id: string;
  timestamp: string;
  grade: string;
  confidence: number;
  input: Record<string, any>;
}

function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("prediction_history") || "[]");
  } catch {
    return [];
  }
}

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setItems(loadHistory());
  }, []);

  const clearHistory = () => {
    localStorage.removeItem("prediction_history");
    setItems([]);
  };

  const gradeDist = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.grade] = (acc[item.grade] || 0) + 1;
    return acc;
  }, {});

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
          <h1 className="text-3xl font-bold text-gray-900">Riwayat Prediksi</h1>
          <p className="text-gray-500 mt-1">Semua prediksi disimpan di browser lokal.</p>
        </div>
        {items.length > 0 && (
          <button
            onClick={clearHistory}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all border border-red-200"
          >
            <Trash2 className="w-4 h-4" />
            Hapus Semua
          </button>
        )}
      </motion.div>

      {items.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total Prediksi</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{items.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <p className="text-xs text-green-700 uppercase tracking-wider font-medium">Grade A</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{totalGradeA}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-xl border border-red-200">
            <p className="text-xs text-red-700 uppercase tracking-wider font-medium">Reject</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{totalReject}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-700 uppercase tracking-wider font-medium">Rata-rata Confidence</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{(avgConf * 100).toFixed(1)}%</p>
          </div>
        </motion.div>
      )}

      {chartData.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Distribusi Grade</h3>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e5e7eb" }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={48}>
                  {chartData.map((entry) => (
                    <rect key={entry.name} fill={GRADE_COLORS[entry.name]?.replace("bg-", "#") || "#999"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Clock className="w-16 h-16 mb-4 opacity-50" />
          <p className="text-lg font-medium text-gray-500">Belum ada riwayat prediksi</p>
          <p className="text-sm mt-1">Lakukan prediksi melalui halaman Prediksi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...items].reverse().map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(idx * 0.03, 0.5) }}
              className={`p-4 rounded-xl border ${GRADE_BG_LIGHT[item.grade] || "bg-gray-50 border-gray-200"}`}
            >
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold text-white ${GRADE_COLORS[item.grade] || "bg-gray-500"}`}>
                    {item.grade}
                  </span>
                  <span className="text-sm text-gray-500">
                    Confidence: <strong>{(item.confidence * 100).toFixed(1)}%</strong>
                  </span>
                </div>
                <span className="text-xs text-gray-400">{new Date(item.timestamp).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(item.input).map(([key, val]) =>
                  val ? (
                    <span key={key} className="text-[11px] bg-white/80 px-2 py-1 rounded-md border text-gray-600">
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

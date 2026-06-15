"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { healthCheck, type HealthResponse } from "@/lib/api";
import { FlaskConical, Activity, AlertTriangle, CheckCircle, Brain, Gauge, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    healthCheck()
      .then(setHealth)
      .catch(() => setHealth(null))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      label: "Status API",
      value: loading ? "..." : health?.status === "ok" ? "Online" : "Offline",
      icon: Activity,
      color: health?.status === "ok" ? "text-green-600" : "text-red-600",
      bg: health?.status === "ok" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
    },
    {
      label: "Model Aktif",
      value: loading ? "..." : health?.model_loaded ? health.model_type ?? "Loaded" : "Not Loaded",
      icon: Brain,
      color: health?.model_loaded ? "text-blue-600" : "text-gray-500",
      bg: health?.model_loaded ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200",
    },
    {
      label: "Endpoint",
      value: health?.status === "ok" ? "/predict" : "Unavailable",
      icon: Gauge,
      color: health?.status === "ok" ? "text-green-600" : "text-red-600",
      bg: health?.status === "ok" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200",
    },
  ];

  const metrics = [
    { label: "F1 Score", value: "0.92", sub: "Weighted" },
    { label: "F1 Reject", value: "0.96", sub: "Safety Critical" },
    { label: "F1 Grade A", value: "0.91", sub: "Premium" },
    { label: "Latency", value: "<15ms", sub: "per inference" },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-2">
          <Activity className="w-3.5 h-3.5" /> Machine Learning • QC Predictive
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
          Milk Quality <span className="text-blue-600">Predictor</span>
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          Prediksi grade kualitas susu pasteurisasi secara real-time berbasis machine learning.
          Kurangi ketergantungan pada lab QC dan ambil tindakan preventif.
        </p>
      </motion.div>

      {!loading && health?.status !== "ok" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">
            API tidak terhubung. Jalankan backend: <code className="bg-amber-100 px-1.5 py-0.5 rounded text-xs font-mono">cd api && uvicorn main:app --reload --port 8000</code>
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`${stat.bg} p-5 rounded-xl border shadow-sm`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{stat.label}</p>
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h2 className="font-semibold text-gray-900 mb-4">Performa Model</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <div key={m.label} className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-900">{m.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{m.label}</p>
              <p className="text-[10px] text-gray-400">{m.sub}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Link
            href="/predict"
            className="group block p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <FlaskConical className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Prediksi Baru</h2>
            <p className="text-sm text-gray-500 mb-3">Masukkan parameter produksi susu untuk prediksi grade real-time.</p>
            <span className="text-sm font-medium text-blue-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Mulai <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
          <Link
            href="/history"
            className="group block p-6 bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
              <Activity className="w-6 h-6 text-indigo-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Riwayat Prediksi</h2>
            <p className="text-sm text-gray-500 mb-3">Lihat histori prediksi dan analisis tren kualitas produksi.</p>
            <span className="text-sm font-medium text-indigo-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Lihat <ArrowRight className="w-4 h-4" />
            </span>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

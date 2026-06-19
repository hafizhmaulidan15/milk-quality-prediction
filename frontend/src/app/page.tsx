"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { healthCheck, type HealthResponse } from "@/lib/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFlask, faHeartPulse, faTriangleExclamation, faBrain, faGauge, faArrowRight, faStar, faChartLine, faShield, faLightbulb, faChartBar } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const tips = [
  {
    icon: faLightbulb,
    title: "pH Ideal 6.6 – 6.8",
    desc: "Susu segar berkualitas punya pH stabil. Di luar rentang ini? Waspada mastitis atau basi.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: faShield,
    title: "Alkohol Test = Kunci",
    desc: "Positif alkohol = protein tidak stabil. Susu bakal pecah saat dipanaskan. Langsung Reject.",
    color: "text-red-400",
    bg: "bg-red-500/10",
  },
  {
    icon: faChartLine,
    title: "Lemak & SNF = Harga",
    desc: "Semakin tinggi Fat & SNF, makin premium grade-nya. Standar SNI minimal 3% lemak.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
];

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
      icon: faHeartPulse,
      color: health?.status === "ok" ? "text-green-400" : "text-red-400",
    },
    {
      label: "Model Aktif",
      value: loading ? "..." : health?.model_loaded ? health.model_type ?? "Loaded" : "Not Loaded",
      icon: faBrain,
      color: health?.model_loaded ? "text-blue-400" : "text-gray-500",
    },
    {
      label: "Endpoint",
      value: health?.status === "ok" ? "/predict" : "Unavailable",
      icon: faGauge,
      color: health?.status === "ok" ? "text-green-400" : "text-red-400",
    },
  ];

  const metrics = [
    { label: "F1 Score", value: "0.92", sub: "Weighted", icon: faChartBar },
    { label: "F1 Reject", value: "0.96", sub: "Safety Critical", icon: faShield },
    { label: "F1 Grade A", value: "0.91", sub: "Premium", icon: faStar },
    { label: "Latency", value: "<15ms", sub: "per inference", icon: faGauge },
  ];

  return (
    <div className="space-y-10 pb-16">
      <Reveal>
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 glass rounded-full text-xs font-medium text-blue-400">
            <FontAwesomeIcon icon={faStar} className="w-3.5 h-3.5" /> Machine Learning • QC Predictive
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Milk Quality <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Predictor</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Prediksi grade kualitas susu pasteurisasi secara real-time berbasis machine learning.
            Kurangi ketergantungan pada lab QC dan ambil tindakan preventif.
          </p>
        </div>
      </Reveal>

      {!loading && health?.status !== "ok" && (
        <Reveal>
          <div className="flex items-center gap-3 p-4 glass border-amber-500/20 rounded-2xl text-amber-400">
            <FontAwesomeIcon icon={faTriangleExclamation} className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">
              API tidak terhubung. Jalankan backend: <code className="bg-amber-500/10 px-1.5 py-0.5 rounded text-xs font-mono">cd api && uvicorn main:app --reload --port 8000</code>
            </p>
          </div>
        </Reveal>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => {
          return (
            <Reveal key={stat.label} delay={i * 0.1}>
              <div className="glass-card p-5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <FontAwesomeIcon icon={stat.icon} className={`w-8 h-8 ${stat.color}`} />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">{stat.label}</p>
                    <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.2}>
        <div className="glass-dark rounded-2xl p-6 md:p-8">
          <h2 className="font-semibold text-white mb-6 text-lg">Performa Model</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metrics.map((m) => {
              return (
                <div key={m.label} className="text-center p-5 glass rounded-2xl">
                  <FontAwesomeIcon icon={m.icon} className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{m.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{m.label}</p>
                  <p className="text-[10px] text-gray-500">{m.sub}</p>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Reveal delay={0.3}>
          <Link
            href="/predict"
            className="group block p-6 glass-card rounded-2xl"
          >
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faFlask} className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">Prediksi Baru</h2>
            <p className="text-sm text-gray-400 mb-3">Masukkan parameter produksi susu untuk prediksi grade real-time.</p>
            <span className="text-sm font-medium text-blue-400 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Mulai <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
            </span>
          </Link>
        </Reveal>
        <Reveal delay={0.35}>
          <Link
            href="/history"
            className="group block p-6 glass-card rounded-2xl"
          >
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FontAwesomeIcon icon={faHeartPulse} className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">Riwayat Prediksi</h2>
            <p className="text-sm text-gray-400 mb-3">Lihat histori prediksi dan analisis tren kualitas produksi.</p>
            <span className="text-sm font-medium text-indigo-400 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
              Lihat <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4" />
            </span>
          </Link>
        </Reveal>
      </div>

      <Reveal delay={0.4}>
        <div className="text-center space-y-2 pb-2">
          <h2 className="text-2xl font-bold text-white">🧠 Masukan & Tips</h2>
          <p className="text-sm text-gray-400">Faktor kritis yang mempengaruhi grade susu</p>
        </div>
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tips.map((tip, i) => {
          return (
            <Reveal key={tip.title} delay={0.45 + i * 0.1}>
              <div className="glass-card p-5 rounded-2xl">
                <div className={`w-10 h-10 ${tip.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <FontAwesomeIcon icon={tip.icon} className={`w-5 h-5 ${tip.color}`} />
                </div>
                <h3 className="font-semibold text-white text-sm mb-1">{tip.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{tip.desc}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

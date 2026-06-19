"use client";

import { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload, faXmark, faChartLine, faTriangleExclamation, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import type { PredictResponse } from "@/lib/api";
import { GRADE_COLORS, GRADE_TEXT_COLORS, GRADE_BG_LIGHT } from "@/lib/api";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { motion } from "framer-motion";

interface Props {
  result: PredictResponse;
  onReset?: () => void;
}

const gradeLabels: Record<string, string> = {
  A: "Kualitas Premium - Lolos Semua Parameter SNI",
  B: "Layak Konsumsi - Deviasi Minor",
  C: "Perlu Penanganan Khusus / Blending",
  Reject: "TIDAK LAYAK - Harus Dibuang",
};

const gradeIcons: Record<string, any> = {
  A: faCircleCheck,
  B: faCircleCheck,
  C: faTriangleExclamation,
  Reject: faTriangleExclamation,
};

export default function PredictionResult({ result, onReset }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  const grade = result.predicted_grade;
  const Gradelcon = gradeIcons[grade] || faCircleCheck;
  const gradeLabel = gradeLabels[grade] || "";
  const isGood = grade === "A" || grade === "B";
  const isBad = grade === "Reject";

  const probData = Object.entries(result.probabilities)
    .map(([name, value]) => ({
      name,
      value: +(value * 100).toFixed(1),
    }))
    .sort((a, b) => b.value - a.value);

  const barColors: Record<string, string> = {
    A: "#22c55e",
    B: "#3b82f6",
    C: "#f59e0b",
    Reject: "#ef4444",
  };

  const handlePrint = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Laporan Prediksi - Milk Quality</title>
      <style>
        body { font-family: Inter, sans-serif; padding: 40px; max-width: 600px; margin: auto; background: #f8f9fc; }
        .grade { font-size: 72px; font-weight: 900; }
        .info { color: #666; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f5f5f5; }
        .rec { background: #eef2ff; padding: 16px; border-radius: 12px; margin-top: 20px; }
      </style></head><body>
      <h1>Laporan Prediksi Kualitas Susu</h1>
      <div class="grade" style="color: ${barColors[grade]}">${grade}</div>
      <div class="info">Confidence: ${(result.confidence * 100).toFixed(1)}%</div>
      <div class="info">${gradeLabel}</div>
      <table>
        <tr><th>Grade</th><th>Probabilitas</th></tr>
        ${probData.map((p) => `<tr><td>${p.name}</td><td>${p.value}%</td></tr>`).join("")}
      </table>
      <h3>Top Features</h3>
      <table>
        <tr><th>Feature</th><th>SHAP Value</th></tr>
        ${result.top_features.map((f) => `<tr><td>${f.feature}</td><td>${f.shap_value.toFixed(4)}</td></tr>`).join("")}
      </table>
      <div class="rec"><strong>Rekomendasi:</strong> ${result.recommendation}</div>
      <p style="color:#999;margin-top:40px;font-size:12px">Dicetak: ${new Date().toLocaleString("id-ID")}</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <motion.div
      ref={printRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <div className={`p-6 rounded-2xl glass-dark shadow-sm ${GRADE_BG_LIGHT[grade] || ""}`}>
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Hasil Prediksi</p>
          <div className="flex gap-1">
            <button onClick={handlePrint} className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Cetak Laporan">
              <FontAwesomeIcon icon={faDownload} className="w-4 h-4 text-gray-400" />
            </button>
            {onReset && (
              <button onClick={onReset} className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Prediksi Baru">
                <FontAwesomeIcon icon={faXmark} className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-5 mb-5">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
            className={`text-7xl font-black ${GRADE_TEXT_COLORS[grade] || "text-gray-700"}`}
          >
            {grade}
          </motion.span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white">
                {(result.confidence * 100).toFixed(1)}%
              </span>
              <FontAwesomeIcon icon={Gradelcon} className={`w-6 h-6 ${isGood ? "text-green-500" : isBad ? "text-red-500" : "text-amber-500"}`} />
            </div>
            <p className="text-sm text-gray-400 mt-0.5">{gradeLabel}</p>
          </div>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={probData} layout="vertical" barCategoryGap="20%">
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 12, fill: "#9ca3af" }} />
              <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} contentStyle={{ borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(20,20,40,0.95)", backdropFilter: "blur(12px)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} barSize={28}>
                {probData.map((entry) => (
                  <Cell key={entry.name} fill={barColors[entry.name] || "#d1d5db"} fillOpacity={entry.name === grade ? 1 : 0.3} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="glass-dark p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <FontAwesomeIcon icon={faChartLine} className="w-5 h-5 text-blue-400" />
          <h3 className="font-semibold text-white">Top Fitur Paling Berpengaruh</h3>
        </div>
        <div className="space-y-3">
          {result.top_features.map((f, i) => {
            const absVal = Math.abs(f.shap_value);
            const maxVal = Math.max(...result.top_features.map((x) => Math.abs(x.shap_value)), 0.01);
            const pct = (absVal / maxVal) * 100;
            const isPositive = f.shap_value >= 0;
            return (
              <motion.div key={f.feature} initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ delay: i * 0.1 }}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300 capitalize font-medium">
                    {f.feature.replace(/_/g, " ")}
                  </span>
                  <span className={`font-mono text-xs font-bold ${isPositive ? "text-green-600" : "text-red-600"}`}>
                    {isPositive ? "+" : ""}{f.shap_value.toFixed(4)}
                  </span>
                </div>
                <div className="h-2.5 glass rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
                    className={`h-full rounded-full ${isPositive ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-gradient-to-r from-red-400 to-red-500"}`}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`p-5 rounded-2xl glass-dark border ${isGood ? "border-green-500/20" : isBad ? "border-red-500/20" : "border-amber-500/20"}`}
      >
        <div className="flex items-start gap-3">
          {isGood ? (
            <FontAwesomeIcon icon={faCircleCheck} className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5" />
          ) : (
            <FontAwesomeIcon icon={faTriangleExclamation} className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-semibold text-sm text-white">Rekomendasi</p>
            <p className="text-sm mt-0.5 text-gray-300">{result.recommendation}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

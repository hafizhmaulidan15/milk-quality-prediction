"use client";

import { motion } from "framer-motion";

export default function LoadingSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-dark p-6 rounded-2xl shadow-sm space-y-6"
    >
      <div className="space-y-3">
        <div className="h-4 bg-white/10 rounded-full w-1/3 animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-white/10 rounded-xl animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-white/10 rounded-full w-1/2 animate-pulse" />
            <div className="h-4 bg-white/10 rounded-full w-1/4 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="h-48 bg-white/5 rounded-xl animate-pulse" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 bg-white/10 rounded-full w-1/3 animate-pulse" />
            <div className="h-2.5 bg-white/5 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
      <div className="h-16 bg-blue-500/10 rounded-xl animate-pulse" />
    </motion.div>
  );
}

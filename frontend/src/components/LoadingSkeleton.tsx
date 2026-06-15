"use client";

import { motion } from "framer-motion";

export default function LoadingSkeleton() {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-6">
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded-full w-1/3 animate-pulse" />
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-gray-200 rounded-xl animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-gray-200 rounded-full w-1/2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded-full w-1/4 animate-pulse" />
          </div>
        </div>
      </div>
      <div className="h-48 bg-gray-100 rounded-xl animate-pulse" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 bg-gray-200 rounded-full w-1/3 animate-pulse" />
            <div className="h-2.5 bg-gray-100 rounded-full animate-pulse" />
          </div>
        ))}
      </div>
      <div className="h-16 bg-blue-50 rounded-xl animate-pulse" />
    </div>
  );
}

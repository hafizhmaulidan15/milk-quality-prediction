"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskConical, History, Home, Menu, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/predict", label: "Prediksi", icon: FlaskConical },
  { href: "/history", label: "Riwayat", icon: History },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-gray-900">Milk <span className="text-blue-600">Quality</span></span>
        </Link>

        <div className="hidden md:flex gap-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  active
                    ? "bg-blue-100 text-blue-700 shadow-sm"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  active ? "bg-blue-100 text-blue-700" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

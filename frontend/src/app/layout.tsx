import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Milk Quality Predictor",
  description: "Prediksi grade kualitas susu pasteurisasi berbasis ML",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, title: "MilkQC", statusBarStyle: "black-translucent" },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen`}>
        <script dangerouslySetInnerHTML={{ __html: `"serviceWorker"in navigator&&navigator.serviceWorker.register("/sw.js")` }} />
        <div className="fixed inset-0 -z-10" style={{ background: "linear-gradient(135deg, var(--bg-start), var(--bg-mid), var(--bg-end))" }} />
        <div className="fixed -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10" />
        <div className="fixed -bottom-40 -left-40 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

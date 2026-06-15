import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Milk Quality Predictor",
  description: "Prediksi grade kualitas susu pasteurisasi berbasis ML",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${inter.className} min-h-screen bg-gray-50`}>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}

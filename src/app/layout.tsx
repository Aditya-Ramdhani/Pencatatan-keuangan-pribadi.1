import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FinTrack - Personal Finance Tracker",
  description: "Aplikasi Web Pencatatan Keuangan Pribadi yang Cepat, Terstruktur, dan Visual",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}


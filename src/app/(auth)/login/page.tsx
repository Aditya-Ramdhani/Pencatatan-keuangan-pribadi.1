"use client";

import { useState } from "react";
import Link from "next/link";
import { loginAction } from "@/actions/auth";
import { WalletCards, Lock, Mail, ArrowRight, Loader2, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await loginAction({ email, password });
      if (res?.error) {
        setError(res.error);
        setLoading(false);
      }
    } catch {
      setError("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 text-white text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md mb-4 shadow-inner">
            <WalletCards className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">FinTrack</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Pantau arus kas harian & bulanan Anda dengan mudah
          </p>
        </div>

        {/* Form Body */}
        <div className="p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-6 text-center">
            Masuk ke Akun Anda
          </h2>

          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
              <span className="font-semibold text-base leading-none mt-0.5">•</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-slate-400 text-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                <>
                  <span>Masuk Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Register Link */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-500">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Daftar Gratis
              </Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-center gap-2 text-xs text-emerald-800">
            <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Pencatatan cepat kurang dari 10 detik dengan ringkasan otomatis.</span>
          </div>
        </div>
      </div>
    </div>
  );
}


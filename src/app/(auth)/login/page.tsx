"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginAction } from "@/actions/auth";
import {
  WalletCards,
  Lock,
  Mail,
  ArrowRight,
  Loader2,
  Sparkles,
  AlertTriangle,
  KeyRound,
  CheckCircle2,
} from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLocked(false);
    setLoading(true);

    try {
      const res = await loginAction({ email, password });
      if (res?.error) {
        setError(res.error);
        if (res.isLocked) {
          setIsLocked(true);
        }
        setLoading(false);
      }
    } catch {
      setError("Terjadi kesalahan yang tidak terduga. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
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
      <div className="p-6 sm:p-8">
        <h2 className="text-xl font-bold text-slate-800 mb-5 text-center">
          Masuk ke Akun Anda
        </h2>

        {/* Success Banner if reset password successful */}
        {resetSuccess && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm flex items-center gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Password berhasil diperbarui! Silakan masuk dengan password baru Anda.</span>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>

            {/* Quick direct Reset Password button if locked or failed */}
            {isLocked && (
              <div className="pt-2 border-t border-red-200/60">
                <Link
                  href={`/forgot-password?email=${encodeURIComponent(email)}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Reset Password Sekarang</span>
                </Link>
              </div>
            )}
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
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                Password
              </label>
              <Link
                href={`/forgot-password${email ? `?email=${encodeURIComponent(email)}` : ""}`}
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
              >
                Lupa Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
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
          <span>Keamanan akun terproteksi dengan pembatasan percobaan login.</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-slate-50 to-teal-50">
      <Suspense fallback={
        <div className="w-full max-w-md p-8 bg-white rounded-3xl shadow-xl flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}

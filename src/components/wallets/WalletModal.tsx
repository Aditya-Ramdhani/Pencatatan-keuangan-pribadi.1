"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Wallet, Landmark, Smartphone, MoreHorizontal } from "lucide-react";
import { parseRupiahInput, formatRupiah } from "@/lib/currency";
import { createWallet, updateWallet } from "@/actions/wallets";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSuccess?: () => void;
}

const WALLET_TYPES = [
  { value: "BANK", label: "Rekening Bank", icon: Landmark },
  { value: "EWALLET", label: "Dompet Digital (E-Wallet)", icon: Smartphone },
  { value: "CASH", label: "Uang Tunai", icon: Wallet },
  { value: "OTHER", label: "Lainnya", icon: MoreHorizontal },
];

const PRESET_COLORS = [
  "#10b981", // Emerald
  "#3b82f6", // Blue
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#f97316", // Orange
  "#06b6d4", // Cyan
  "#eab308", // Yellow
  "#64748b", // Slate
];

export function WalletModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: WalletModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"BANK" | "EWALLET" | "CASH" | "OTHER">("BANK");
  const [balanceStr, setBalanceStr] = useState("");
  const [color, setColor] = useState("#10b981");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setType(initialData.type || "BANK");
      setBalanceStr(initialData.balance ? initialData.balance.toString() : "0");
      setColor(initialData.color || "#10b981");
    } else {
      setName("");
      setType("BANK");
      setBalanceStr("");
      setColor("#10b981");
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const rawBalance = parseRupiahInput(balanceStr);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama dompet wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        type,
        balance: rawBalance,
        color,
      };

      let res;
      if (initialData?.id) {
        res = await updateWallet(initialData.id, payload);
      } else {
        res = await createWallet(payload);
      }

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setLoading(false);
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch {
      setError("Terjadi kesalahan sistem.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? "Edit Dompet" : "Tambah Dompet / Sumber Dana"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Nama Dompet / Rekening
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BCA, GoPay, Dompet Tunai"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Tipe Dompet
            </label>
            <div className="grid grid-cols-2 gap-2">
              {WALLET_TYPES.map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.value;
                return (
                  <button
                    type="button"
                    key={t.value}
                    onClick={() => setType(t.value as any)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/20"
                        : "border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {!initialData && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Saldo Awal (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  Rp
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={balanceStr ? Number(rawBalance).toLocaleString("id-ID") : ""}
                  onChange={(e) => setBalanceStr(e.target.value)}
                  placeholder="0"
                  className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-semibold"
                />
              </div>
              {rawBalance > 0 && (
                <p className="mt-1 text-xs text-emerald-600 font-medium">
                  {formatRupiah(rawBalance)}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Warna Penanda
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c ? "scale-125 ring-2 ring-slate-800 ring-offset-2" : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{initialData ? "Simpan Perubahan" : "Buat Dompet"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


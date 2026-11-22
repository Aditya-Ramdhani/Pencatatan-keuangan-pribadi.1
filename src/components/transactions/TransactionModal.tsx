"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ArrowRightLeft, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { formatRupiah, parseRupiahInput } from "@/lib/currency";
import { createTransaction, updateTransaction } from "@/actions/transactions";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface WalletItem {
  id: string;
  name: string;
  balance: number;
}

interface CategoryItem {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
}

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: WalletItem[];
  categories: CategoryItem[];
  initialData?: any; // For editing
  onSuccess?: () => void;
}

export function TransactionModal({
  isOpen,
  onClose,
  wallets,
  categories,
  initialData,
  onSuccess,
}: TransactionModalProps) {
  const [type, setType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">("EXPENSE");
  const [amountStr, setAmountStr] = useState("");
  const [walletId, setWalletId] = useState("");
  const [toWalletId, setToWalletId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [transactionDate, setTransactionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset form state
  useEffect(() => {
    if (initialData) {
      setType(initialData.type || "EXPENSE");
      setAmountStr(initialData.amount ? initialData.amount.toString() : "");
      setWalletId(initialData.walletId || (wallets[0]?.id || ""));
      setToWalletId(initialData.toWalletId || "");
      setCategoryId(initialData.categoryId || "");
      const d = initialData.transactionDate
        ? new Date(initialData.transactionDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      setTransactionDate(d);
      setNote(initialData.note || "");
    } else {
      setType("EXPENSE");
      setAmountStr("");
      setWalletId(wallets[0]?.id || "");
      setToWalletId(wallets[1]?.id || "");
      setCategoryId("");
      setTransactionDate(new Date().toISOString().split("T")[0]);
      setNote("");
    }
    setError(null);
  }, [initialData, isOpen, wallets]);

  if (!isOpen) return null;

  const rawAmount = parseRupiahInput(amountStr);

  // Filter categories by type
  const availableCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rawAmount <= 0) {
      setError("Nominal harus lebih dari 0.");
      return;
    }

    if (!walletId) {
      setError("Pilih dompet sumber transaksi.");
      return;
    }

    if (type === "TRANSFER") {
      if (!toWalletId) {
        setError("Pilih dompet tujuan transfer.");
        return;
      }
      if (toWalletId === walletId) {
        setError("Dompet asal dan tujuan tidak boleh sama.");
        return;
      }
    } else {
      if (!categoryId) {
        setError("Pilih kategori transaksi.");
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        type,
        amount: rawAmount,
        walletId,
        toWalletId: type === "TRANSFER" ? toWalletId : null,
        categoryId: type === "TRANSFER" ? null : categoryId,
        transactionDate,
        note: note.trim() || null,
      };

      let res;
      if (initialData?.id) {
        res = await updateTransaction(initialData.id, payload);
      } else {
        res = await createTransaction(payload);
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
      setError("Terjadi kesalahan sistem saat menyimpan transaksi.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            {initialData ? "Edit Transaksi" : "Catat Transaksi"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Type Selector Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                setType("EXPENSE");
                setCategoryId("");
              }}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all ${
                type === "EXPENSE"
                  ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType("INCOME");
                setCategoryId("");
              }}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all ${
                type === "INCOME"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Pemasukan</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setType("TRANSFER");
                setCategoryId("");
              }}
              className={`flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all ${
                type === "TRANSFER"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Amount Input with Live Rupiah Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Nominal (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-base sm:text-lg">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={amountStr ? Number(rawAmount).toLocaleString("id-ID") : ""}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0"
                className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-xl sm:text-2xl font-bold rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 placeholder:text-slate-300"
              />
            </div>
            {rawAmount > 0 && (
              <p className="mt-1 text-xs text-emerald-600 font-medium">
                Terbaca: {formatRupiah(rawAmount)}
              </p>
            )}
          </div>

          {/* Wallets */}
          {type === "TRANSFER" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Dari Dompet
                </label>
                <select
                  value={walletId}
                  onChange={(e) => setWalletId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
                >
                  <option value="">Pilih Asal</option>
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatRupiah(w.balance)})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Ke Dompet
                </label>
                <select
                  value={toWalletId}
                  onChange={(e) => setToWalletId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
                >
                  <option value="">Pilih Tujuan</option>
                  {wallets
                    .filter((w) => w.id !== walletId)
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({formatRupiah(w.balance)})
                      </option>
                    ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Dompet / Sumber Dana
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} — Saldo: {formatRupiah(w.balance)}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category Selector (If not Transfer) */}
          {type !== "TRANSFER" && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Kategori {type === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
              </label>
              {availableCategories.length === 0 ? (
                <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl">
                  Belum ada kategori untuk jenis ini.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2 max-h-36 sm:max-h-40 overflow-y-auto p-1">
                  {availableCategories.map((c) => {
                    const isSelected = categoryId === c.id;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setCategoryId(c.id)}
                        className={`flex flex-col items-center justify-center p-2 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? "border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/30 text-emerald-900"
                            : "border-slate-200 hover:border-slate-300 text-slate-700 bg-white"
                        }`}
                      >
                        <div
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center mb-1 text-white"
                          style={{ backgroundColor: c.color }}
                        >
                          <CategoryIcon name={c.icon} size={15} />
                        </div>
                        <span className="text-[10px] sm:text-[11px] font-medium leading-tight truncate w-full">
                          {c.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Date & Note */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Tanggal Transaksi
              </label>
              <input
                type="date"
                required
                value={transactionDate}
                onChange={(e) => setTransactionDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Makan siang"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-70 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan Transaksi...</span>
                </>
              ) : (
                <span>{initialData ? "Simpan Perubahan" : "Simpan Transaksi"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

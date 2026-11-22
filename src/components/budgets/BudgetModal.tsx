"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { parseRupiahInput, formatRupiah } from "@/lib/currency";
import { setBudget } from "@/actions/budgets";
import { CategoryIcon } from "@/components/ui/CategoryIcon";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: any[];
  month: string;
  initialData?: any;
  onSuccess?: () => void;
}

export function BudgetModal({
  isOpen,
  onClose,
  categories,
  month,
  initialData,
  onSuccess,
}: BudgetModalProps) {
  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  const [categoryId, setCategoryId] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state whenever initialData or modal opens
  useEffect(() => {
    if (initialData) {
      setCategoryId(initialData.categoryId || "");
      setAmountStr(initialData.limitAmount ? initialData.limitAmount.toString() : "");
    } else {
      setCategoryId(expenseCategories[0]?.id || "");
      setAmountStr("");
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const rawAmount = parseRupiahInput(amountStr);
  const selectedCategory = categories.find((c) => c.id === categoryId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError("Pilih kategori pengeluaran.");
      return;
    }

    if (rawAmount <= 0) {
      setError("Batas anggaran harus lebih dari 0.");
      return;
    }

    setLoading(true);

    try {
      const res = await setBudget({
        categoryId,
        month,
        amount: rawAmount,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setLoading(false);
        onClose();
        if (onSuccess) onSuccess();
      }
    } catch {
      setError("Terjadi kesalahan sistem saat menyimpan anggaran.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {initialData ? "Ubah Batas Anggaran" : "Tentukan Batas Anggaran"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Periode: {month}
            </p>
          </div>
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

          {/* Kategori Pengeluaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Kategori Pengeluaran
            </label>
            {initialData ? (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0"
                  style={{ backgroundColor: selectedCategory?.color || initialData.categoryColor || "#6b7280" }}
                >
                  <CategoryIcon name={selectedCategory?.icon || initialData.categoryIcon || "Tag"} size={16} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-800">
                    {selectedCategory?.name || initialData.categoryName}
                  </p>
                  <span className="text-[11px] text-slate-400">
                    Kategori tetap untuk entri ini
                  </span>
                </div>
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
              >
                {expenseCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Batas Maksimal Nominal */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Batas Maksimal Pengeluaran (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                autoFocus
                value={amountStr ? Number(rawAmount).toLocaleString("id-ID") : ""}
                onChange={(e) => setAmountStr(e.target.value)}
                placeholder="0"
                className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-semibold"
              />
            </div>
            {rawAmount > 0 && (
              <p className="mt-1 text-xs text-emerald-600 font-medium">
                Terbaca: {formatRupiah(rawAmount)} per bulan
              </p>
            )}
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
                  <span>Menyimpan Perubahan...</span>
                </>
              ) : (
                <span>{initialData ? "Simpan Perubahan Anggaran" : "Simpan Anggaran"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

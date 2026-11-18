"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { createCategory, updateCategory } from "@/actions/categories";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onSuccess?: () => void;
}

const AVAILABLE_ICONS = [
  "Utensils",
  "Car",
  "Receipt",
  "ShoppingBag",
  "Gamepad2",
  "HeartPulse",
  "GraduationCap",
  "Home",
  "Plane",
  "Coffee",
  "Shirt",
  "Smartphone",
  "Banknote",
  "Award",
  "TrendingUp",
  "Gift",
  "Briefcase",
  "Coins",
  "Sparkles",
  "Tag",
];

const PRESET_COLORS = [
  "#f97316", // Orange
  "#ef4444", // Red
  "#ec4899", // Pink
  "#8b5cf6", // Purple
  "#3b82f6", // Blue
  "#06b6d4", // Cyan
  "#14b8a6", // Teal
  "#10b981", // Emerald
  "#84cc16", // Lime
  "#eab308", // Yellow
  "#64748b", // Slate
  "#6b7280", // Gray
];

export function CategoryModal({
  isOpen,
  onClose,
  initialData,
  onSuccess,
}: CategoryModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [icon, setIcon] = useState("Tag");
  const [color, setColor] = useState("#f97316");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setType(initialData.type || "EXPENSE");
      setIcon(initialData.icon || "Tag");
      setColor(initialData.color || "#f97316");
    } else {
      setName("");
      setType("EXPENSE");
      setIcon("Tag");
      setColor("#f97316");
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Nama kategori wajib diisi.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        type,
        icon,
        color,
      };

      let res;
      if (initialData?.id) {
        res = await updateCategory(initialData.id, payload);
      } else {
        res = await createCategory(payload);
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
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">
            {initialData ? "Edit Kategori" : "Tambah Kategori Baru"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">
              {error}
            </div>
          )}

          {/* Type Selector */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => setType("EXPENSE")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                type === "EXPENSE"
                  ? "bg-red-500 text-white shadow-md shadow-red-500/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => setType("INCOME")}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                type === "INCOME"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Pemasukan</span>
            </button>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              Nama Kategori
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Langganan Streaming, Uang Makan"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          {/* Icon Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Pilih Ikon
            </label>
            <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-2xl bg-slate-50/50">
              {AVAILABLE_ICONS.map((iconName) => {
                const isSelected = icon === iconName;
                return (
                  <button
                    type="button"
                    key={iconName}
                    onClick={() => setIcon(iconName)}
                    className={`flex items-center justify-center p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-500/30"
                        : "border-slate-200 hover:border-slate-300 text-slate-600 bg-white"
                    }`}
                  >
                    <CategoryIcon name={iconName} size={20} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Warna Penanda (Grafik & Label)
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === c
                      ? "scale-125 ring-2 ring-slate-800 ring-offset-2"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview Badge */}
          <div className="pt-2">
            <span className="text-xs text-slate-400 block mb-1">Pratinjau:</span>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-800">
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-white"
                style={{ backgroundColor: color }}
              >
                <CategoryIcon name={icon} size={12} />
              </div>
              <span>{name || "Nama Kategori"}</span>
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
                <span>{initialData ? "Simpan Perubahan" : "Buat Kategori"}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


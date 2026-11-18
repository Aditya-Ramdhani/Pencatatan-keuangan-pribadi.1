"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/currency";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { BudgetModal } from "@/components/budgets/BudgetModal";
import { deleteBudget } from "@/actions/budgets";
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface BudgetManagementViewProps {
  budgets: any[];
  categories: any[];
  currentMonth: string;
}

export function BudgetManagementView({
  budgets,
  categories,
  currentMonth: initialMonth,
}: BudgetManagementViewProps) {
  const router = useRouter();
  const [month, setMonth] = useState(initialMonth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth);
    router.push(`/budgets?month=${newMonth}`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus batas anggaran ini?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteBudget(id);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } catch {
      alert("Gagal menghapus batas anggaran.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (b: any) => {
    setEditingBudget(b);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const totalLimit = budgets.reduce((acc, b) => acc + b.limitAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);
  const totalPercentage = totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
            Batas Anggaran Bulanan
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kendalikan pengeluaran per kategori agar tidak melebihi rencana
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <input
              type="month"
              value={month}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Atur Anggaran</span>
          </button>
        </div>
      </div>

      {/* Aggregate Overview Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Pemakaian Anggaran Bulan Ini
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl lg:text-3xl font-extrabold text-slate-900">
                {formatRupiah(totalSpent)}
              </span>
              <span className="text-slate-400 text-sm">
                dari batas {formatRupiah(totalLimit)}
              </span>
            </div>
          </div>
          <div className="text-right sm:self-center">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                totalPercentage >= 100
                  ? "bg-red-100 text-red-700"
                  : totalPercentage >= 80
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {totalPercentage.toFixed(1)}% Terpakai
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalPercentage >= 100
                ? "bg-red-500"
                : totalPercentage >= 80
                ? "bg-amber-400"
                : "bg-emerald-500"
            }`}
            style={{ width: `${Math.min(totalPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Budgets List */}
      {budgets.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <Target className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-700 text-lg">
            Belum ada batas anggaran untuk bulan ini
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            Tentukan target maksimal untuk pos pengeluaran Anda seperti Makan & Minum atau Belanja agar pengeluaran tetap terkontrol.
          </p>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tentukan Anggaran Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgets.map((b) => {
            const isExceeded = b.status === "exceeded";
            const isWarning = b.status === "warning";

            return (
              <div
                key={b.id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header item */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: b.categoryColor }}
                    >
                      <CategoryIcon name={b.categoryIcon} size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base">
                        {b.categoryName}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {isExceeded ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            Over Budget ({b.rawPercentage.toFixed(0)}%)
                          </span>
                        ) : isWarning ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            Waspada ({b.rawPercentage.toFixed(0)}%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Aman ({b.rawPercentage.toFixed(0)}%)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(b)}
                      title="Edit Anggaran"
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      disabled={deletingId === b.id}
                      title="Hapus Anggaran"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {deletingId === b.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isExceeded
                          ? "bg-red-500"
                          : isWarning
                          ? "bg-amber-400"
                          : "bg-emerald-500"
                      }`}
                      style={{ width: `${b.percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Terpakai: {formatRupiah(b.spentAmount)}</span>
                    <span>Batas: {formatRupiah(b.limitAmount)}</span>
                  </div>
                </div>

                {/* Remaining Info */}
                <div className="pt-2 border-t border-slate-50 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {isExceeded ? "Kelebihan Pengeluaran:" : "Sisa Anggaran:"}
                  </span>
                  <span
                    className={`font-bold ${
                      isExceeded ? "text-red-600" : "text-emerald-700"
                    }`}
                  >
                    {isExceeded
                      ? `+${formatRupiah(Math.abs(b.remainingAmount))}`
                      : formatRupiah(b.remainingAmount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        categories={categories}
        month={month}
        initialData={editingBudget}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}


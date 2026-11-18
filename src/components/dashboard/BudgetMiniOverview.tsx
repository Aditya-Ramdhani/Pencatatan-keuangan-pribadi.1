import Link from "next/link";
import { formatRupiah } from "@/lib/currency";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { ArrowRight, AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";

interface BudgetMiniOverviewProps {
  budgets: {
    id: string;
    categoryName: string;
    categoryColor: string;
    categoryIcon: string;
    limitAmount: number;
    spentAmount: number;
    percentage: number;
    rawPercentage: number;
    status: "normal" | "warning" | "exceeded";
  }[];
}

export function BudgetMiniOverview({ budgets }: BudgetMiniOverviewProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800">Target Anggaran Bulan Ini</h3>
          <p className="text-xs text-slate-400">Pantau batas pengeluaran per kategori</p>
        </div>
        <Link
          href="/budgets"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
        >
          <span>Atur Anggaran</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {budgets.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          <p>Belum ada target anggaran yang ditentukan.</p>
          <Link
            href="/budgets"
            className="inline-block mt-2 text-xs font-semibold text-emerald-600 hover:underline"
          >
            + Tentukan Batas Anggaran Sekarang
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.slice(0, 4).map((b) => {
            const isExceeded = b.status === "exceeded";
            const isWarning = b.status === "warning";

            return (
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[10px]"
                      style={{ backgroundColor: b.categoryColor }}
                    >
                      <CategoryIcon name={b.categoryIcon} size={12} />
                    </div>
                    <span className="font-semibold text-slate-700">
                      {b.categoryName}
                    </span>
                    {isExceeded && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded-full">
                        <ShieldAlert className="w-3 h-3" />
                        Melebihi Batas
                      </span>
                    )}
                    {isWarning && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" />
                        Hampir Habis
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-800">
                      {formatRupiah(b.spentAmount)}
                    </span>
                    <span className="text-slate-400"> / {formatRupiah(b.limitAmount)}</span>
                  </div>
                </div>

                {/* Progress Bar with Color Transitions */}
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


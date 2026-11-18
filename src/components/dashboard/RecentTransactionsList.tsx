import Link from "next/link";
import { formatRupiah, formatDateShort } from "@/lib/currency";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { ArrowRight, ArrowLeftRight } from "lucide-react";

interface RecentTransactionsListProps {
  transactions: any[];
}

export function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800">Transaksi Terbaru</h3>
          <p className="text-xs text-slate-400">5 transaksi terakhir yang Anda catat</p>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 group"
        >
          <span>Lihat Semua</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-sm">
          <p>Belum ada riwayat transaksi.</p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {transactions.map((t) => {
            const isExpense = t.type === "EXPENSE";
            const isIncome = t.type === "INCOME";
            const isTransfer = t.type === "TRANSFER";

            return (
              <div
                key={t.id}
                className="py-3.5 flex items-center justify-between gap-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0"
                    style={{
                      backgroundColor: isTransfer
                        ? "#3b82f6"
                        : t.category?.color || "#6b7280",
                    }}
                  >
                    {isTransfer ? (
                      <ArrowLeftRight className="w-5 h-5" />
                    ) : (
                      <CategoryIcon name={t.category?.icon || "Tag"} size={18} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {isTransfer
                        ? `Transfer: ${t.wallet?.name} ➔ ${t.toWallet?.name}`
                        : t.category?.name || "Tanpa Kategori"}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {t.note ? `${t.note} • ` : ""}
                      {formatDateShort(t.transactionDate)} • {t.wallet?.name}
                    </p>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p
                    className={`text-sm font-bold ${
                      isExpense
                        ? "text-red-500"
                        : isIncome
                        ? "text-emerald-600"
                        : "text-blue-600"
                    }`}
                  >
                    {isExpense ? "-" : isIncome ? "+" : ""}
                    {formatRupiah(t.amount)}
                  </p>
                  <span className="text-[10px] font-medium uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {isExpense
                      ? "Pengeluaran"
                      : isIncome
                      ? "Pemasukan"
                      : "Transfer"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}


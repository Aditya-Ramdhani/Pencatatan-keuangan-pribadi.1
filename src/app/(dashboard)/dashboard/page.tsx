import { getDashboardData } from "@/actions/dashboard";
import { KPICards } from "@/components/dashboard/KPICards";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { CategoryExpenseChart } from "@/components/dashboard/CategoryExpenseChart";
import { RecentTransactionsList } from "@/components/dashboard/RecentTransactionsList";
import { BudgetMiniOverview } from "@/components/dashboard/BudgetMiniOverview";
import { formatRupiah } from "@/lib/currency";
import { Calendar, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const data = await getDashboardData();
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Page Title & Active Month Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
            Ringkasan Keuangan
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Ikhtisar arus kas dan distribusi keuangan Anda
          </p>
        </div>

        <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm w-fit">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span>Periode: {data.currentMonthName}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <KPICards kpi={data.kpi} />

      {/* Wallets Quick Strip */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-sm">Dompet & Rekening Aktif</h3>
          <Link
            href="/wallets"
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
          >
            <span>Kelola Dompet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {data.wallets.map((w) => (
            <div
              key={w.id}
              className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: w.color || "#10b981" }}
                />
                <span className="text-xs font-semibold text-slate-700 truncate">
                  {w.name}
                </span>
              </div>
              <p className="text-base font-bold text-slate-900">
                {formatRupiah(w.balance)}
              </p>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider">
                {w.type}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Arus Kas 6 Bulan Terakhir */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800">Arus Kas Bulanan</h3>
            <p className="text-xs text-slate-400">
              Perbandingan Pemasukan vs Pengeluaran 6 bulan terakhir
            </p>
          </div>
          <CashFlowChart data={data.cashFlowChartData} />
        </div>

        {/* Proporsi Pengeluaran Bulan Aktif */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800">Distribusi Pengeluaran</h3>
            <p className="text-xs text-slate-400">
              Pos pengeluaran terbesar untuk bulan {data.currentMonthName}
            </p>
          </div>
          <CategoryExpenseChart data={data.categoryExpenses} />
        </div>
      </div>

      {/* Lower Grid: Recent Transactions & Active Budgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactionsList transactions={data.recentTransactions} />
        <BudgetMiniOverview budgets={data.budgetProgress} />
      </div>
    </div>
  );
}


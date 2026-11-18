import { formatRupiah } from "@/lib/currency";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Scale,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

interface KPICardsProps {
  kpi: {
    totalBalance: number;
    currentIncome: number;
    currentExpense: number;
    netCashFlow: number;
    incomeGrowth: number;
    expenseGrowth: number;
  };
}

export function KPICards({ kpi }: KPICardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Saldo */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Saldo Gabungan
          </span>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800">
          {formatRupiah(kpi.totalBalance)}
        </h3>
        <p className="text-xs text-slate-400 mt-1">Akumulasi dari semua dompet</p>
      </div>

      {/* Pemasukan Bulan Ini */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pemasukan Bulan Ini
          </span>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-emerald-600">
          +{formatRupiah(kpi.currentIncome)}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 text-xs">
          {kpi.incomeGrowth >= 0 ? (
            <span className="text-emerald-600 font-medium flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {kpi.incomeGrowth.toFixed(1)}%
            </span>
          ) : (
            <span className="text-red-500 font-medium flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5" />
              {Math.abs(kpi.incomeGrowth).toFixed(1)}%
            </span>
          )}
          <span className="text-slate-400">vs bulan lalu</span>
        </div>
      </div>

      {/* Pengeluaran Bulan Ini */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Pengeluaran Bulan Ini
          </span>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-red-500">
          -{formatRupiah(kpi.currentExpense)}
        </h3>
        <div className="flex items-center gap-1.5 mt-1 text-xs">
          {kpi.expenseGrowth <= 0 ? (
            <span className="text-emerald-600 font-medium flex items-center">
              <ArrowDownRight className="w-3.5 h-3.5" />
              {Math.abs(kpi.expenseGrowth).toFixed(1)}%
            </span>
          ) : (
            <span className="text-red-500 font-medium flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              {kpi.expenseGrowth.toFixed(1)}%
            </span>
          )}
          <span className="text-slate-400">vs bulan lalu</span>
        </div>
      </div>

      {/* Selisih Bersih (Net Cash Flow) */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Arus Kas Bersih
          </span>
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              kpi.netCashFlow >= 0
                ? "bg-blue-50 text-blue-600"
                : "bg-amber-50 text-amber-600"
            }`}
          >
            <Scale className="w-5 h-5" />
          </div>
        </div>
        <h3
          className={`text-2xl font-bold ${
            kpi.netCashFlow >= 0 ? "text-blue-600" : "text-amber-600"
          }`}
        >
          {kpi.netCashFlow >= 0 ? "+" : ""}
          {formatRupiah(kpi.netCashFlow)}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          {kpi.netCashFlow >= 0
            ? "Surplus (Keuangan Sehat)"
            : "Defisit (Pengeluaran > Pemasukan)"}
        </p>
      </div>
    </div>
  );
}


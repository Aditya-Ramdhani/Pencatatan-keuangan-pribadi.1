"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Plus,
  WalletCards,
  Target,
} from "lucide-react";

interface BottomNavProps {
  onOpenQuickAdd: () => void;
}

export function BottomNav({ onOpenQuickAdd }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-md border-t border-slate-200 px-3 py-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-xs font-medium ${
            pathname === "/dashboard" ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Ringkasan</span>
        </Link>

        <Link
          href="/transactions"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-xs font-medium ${
            pathname === "/transactions" ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          <ArrowLeftRight className="w-5 h-5" />
          <span>Transaksi</span>
        </Link>

        {/* Center Quick Action Floating Button */}
        <div className="relative -top-4">
          <button
            onClick={onOpenQuickAdd}
            className="w-13 h-13 p-3.5 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
            title="Tambah Transaksi Cepat"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        <Link
          href="/wallets"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-xs font-medium ${
            pathname === "/wallets" ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          <WalletCards className="w-5 h-5" />
          <span>Dompet</span>
        </Link>

        <Link
          href="/budgets"
          className={`flex flex-col items-center gap-1 py-1 px-2 text-xs font-medium ${
            pathname === "/budgets" ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          <Target className="w-5 h-5" />
          <span>Anggaran</span>
        </Link>
      </div>
    </div>
  );
}


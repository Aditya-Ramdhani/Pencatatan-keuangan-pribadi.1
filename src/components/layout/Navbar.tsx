"use client";

import { Plus, WalletCards, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";

interface NavbarProps {
  userName: string;
  onOpenQuickAdd: () => void;
}

export function Navbar({ userName, onOpenQuickAdd }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 px-4 lg:px-8 flex items-center justify-between">
      {/* Mobile Brand / Greeting */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
          <WalletCards className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Selamat Datang,</p>
          <h2 className="text-base lg:text-lg font-bold text-slate-800 leading-tight">
            {userName}
          </h2>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenQuickAdd}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Catat Transaksi</span>
          <span className="sm:hidden">Catat</span>
        </button>

        <form action={logoutAction} className="lg:hidden">
          <button
            type="submit"
            title="Keluar"
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </div>
    </header>
  );
}


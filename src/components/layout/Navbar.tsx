"use client";

import { WalletCards, LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";

interface NavbarProps {
  userName: string;
}

export function Navbar({ userName }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-200 h-16 px-4 lg:px-8 flex items-center justify-between">
      {/* Brand / Greeting */}
      <div className="flex items-center gap-3">
        <div className="lg:hidden w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm">
          <WalletCards className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs text-slate-400 font-medium">Selamat Datang,</p>
          <h2 className="text-base lg:text-lg font-bold text-slate-800 leading-tight">
            {userName}
          </h2>
        </div>
      </div>

      {/* Right Controls (Logout on Mobile) */}
      <div className="flex items-center gap-3">
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

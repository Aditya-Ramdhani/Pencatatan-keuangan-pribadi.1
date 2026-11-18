"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  Tags,
  Target,
  LogOut,
  FileDown,
} from "lucide-react";
import { logoutAction } from "@/actions/auth";

interface SidebarProps {
  user: {
    name: string;
    email: string;
  };
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { href: "/wallets", label: "Dompet & Akun", icon: WalletCards },
  { href: "/categories", label: "Kategori", icon: Tags },
  { href: "/budgets", label: "Batas Anggaran", icon: Target },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 fixed inset-y-0 left-0 z-30">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-100">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
          <WalletCards className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-slate-800 tracking-tight leading-none">FinTrack</h1>
          <span className="text-[11px] font-medium text-emerald-600 uppercase tracking-wider">
            Finance Tracker
          </span>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Menu Utama
        </div>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? "bg-emerald-50 text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive ? "text-emerald-600" : "text-slate-400"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <div className="pt-6 px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Laporan
        </div>
        <a
          href="/api/export"
          download
          className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-all"
        >
          <FileDown className="w-5 h-5 text-slate-400" />
          <span>Ekspor CSV</span>
        </a>
      </div>

      {/* User Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="truncate mr-2">
            <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              title="Keluar"
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}


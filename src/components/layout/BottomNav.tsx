"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  WalletCards,
  Tags,
  Target,
} from "lucide-react";

export function BottomNav() {
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: "/dashboard", label: "Ringkasan", icon: LayoutDashboard },
    { href: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
    { href: "/wallets", label: "Dompet", icon: WalletCards },
    { href: "/categories", label: "Kategori", icon: Tags },
    { href: "/budgets", label: "Anggaran", icon: Target },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-lg shadow-slate-900/5">
      <div className="grid grid-cols-5 items-center max-w-lg mx-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all ${
                isActive
                  ? "text-emerald-600 font-bold bg-emerald-50/70"
                  : "text-slate-500 hover:text-slate-800 font-medium"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-emerald-600 stroke-[2.5]" : "text-slate-400"}`} />
              <span className="text-[10px] leading-tight truncate w-full text-center">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

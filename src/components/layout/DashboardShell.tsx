"use client";

import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";

interface DashboardShellProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  wallets: any[];
  categories: any[];
  children: React.ReactNode;
}

export function DashboardShell({
  user,
  children,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Desktop */}
      <Sidebar user={user} />

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar userName={user.name} />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Bottom Nav for Mobile */}
        <BottomNav />
      </div>
    </div>
  );
}

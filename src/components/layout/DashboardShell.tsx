"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { BottomNav } from "./BottomNav";
import { TransactionModal } from "@/components/transactions/TransactionModal";

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
  wallets,
  categories,
  children,
}: DashboardShellProps) {
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar for Desktop */}
      <Sidebar user={user} />

      {/* Main Container */}
      <div className="flex-1 lg:pl-64 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <Navbar
          userName={user.name}
          onOpenQuickAdd={() => setIsQuickAddOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-12 max-w-7xl mx-auto w-full">
          {children}
        </main>

        {/* Bottom Nav for Mobile */}
        <BottomNav onOpenQuickAdd={() => setIsQuickAddOpen(true)} />

        {/* Global Quick Add Transaction Modal */}
        <TransactionModal
          isOpen={isQuickAddOpen}
          onClose={() => setIsQuickAddOpen(false)}
          wallets={wallets}
          categories={categories}
        />
      </div>
    </div>
  );
}


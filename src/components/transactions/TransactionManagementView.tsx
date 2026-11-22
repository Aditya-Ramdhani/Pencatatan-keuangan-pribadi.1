"use client";

import { useState } from "react";
import { formatRupiah, formatDateShort } from "@/lib/currency";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { TransactionModal } from "@/components/transactions/TransactionModal";
import { deleteTransaction } from "@/actions/transactions";
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  FileDown,
  ArrowLeftRight,
  Plus,
  Loader2,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface TransactionManagementViewProps {
  initialTransactions: any[];
  wallets: any[];
  categories: any[];
  currentMonth: string;
}

export function TransactionManagementView({
  initialTransactions,
  wallets,
  categories,
  currentMonth,
}: TransactionManagementViewProps) {
  const router = useRouter();

  // Filters state
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedWallet, setSelectedWallet] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth);
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Edit / Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter logic on client
  const filteredTransactions = initialTransactions.filter((t) => {
    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchNote = t.note?.toLowerCase().includes(q);
      const matchCat = t.category?.name?.toLowerCase().includes(q);
      const matchWallet = t.wallet?.name?.toLowerCase().includes(q);
      if (!matchNote && !matchCat && !matchWallet) return false;
    }

    // Type
    if (selectedType !== "ALL" && t.type !== selectedType) {
      return false;
    }

    // Wallet
    if (selectedWallet !== "ALL") {
      if (t.walletId !== selectedWallet && t.toWalletId !== selectedWallet) {
        return false;
      }
    }

    // Category
    if (selectedCategory !== "ALL" && t.categoryId !== selectedCategory) {
      return false;
    }

    // Month
    if (selectedMonth) {
      const dateStr = new Date(t.transactionDate).toISOString().slice(0, 7);
      if (dateStr !== selectedMonth) {
        return false;
      }
    }

    return true;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus transaksi ini? Saldo dompet akan disesuaikan kembali.")) {
      return;
    }

    setDeletingId(id);
    try {
      await deleteTransaction(id);
      router.refresh();
    } catch {
      alert("Gagal menghapus transaksi.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  const resetFilters = () => {
    setSearch("");
    setSelectedType("ALL");
    setSelectedWallet("ALL");
    setSelectedCategory("ALL");
    setSelectedMonth(currentMonth);
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    selectedType !== "ALL" ||
    selectedWallet !== "ALL" ||
    selectedCategory !== "ALL" ||
    selectedMonth !== currentMonth;

  // Calculate totals for filtered list
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Prominent Add Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
            Riwayat Transaksi
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Daftar lengkap pemasukan, pengeluaran, dan transfer
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href={`/api/export?month=${selectedMonth}`}
            download
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold shadow-sm transition-colors"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV</span>
          </a>

          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/25 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Summary Cards (Mobile & Desktop Responsive) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-3 sm:p-4">
          <span className="text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider block">
            Total Pemasukan
          </span>
          <p className="text-base sm:text-xl font-extrabold text-emerald-700 mt-0.5 truncate">
            +{formatRupiah(totalIncome)}
          </p>
        </div>
        <div className="bg-red-50/70 border border-red-100 rounded-2xl p-3 sm:p-4">
          <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-wider block">
            Total Pengeluaran
          </span>
          <p className="text-base sm:text-xl font-extrabold text-red-600 mt-0.5 truncate">
            -{formatRupiah(totalExpense)}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-100 shadow-sm space-y-3">
        {/* Top Search & Filter Toggle on Mobile */}
        <div className="flex items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari transaksi atau catatan..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          {/* Month Input on Top */}
          <div className="w-36 sm:w-44 flex-shrink-0">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-2.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setShowFiltersMobile(!showFiltersMobile)}
            className={`sm:hidden p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-colors ${
              showFiltersMobile || hasActiveFilters
                ? "bg-emerald-50 border-emerald-500 text-emerald-700"
                : "border-slate-200 text-slate-600 bg-white"
            }`}
            title="Filter Opsi"
          >
            <Filter className="w-4 h-4" />
            {showFiltersMobile ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Filter Dropdowns (Always visible on Desktop, collapsible on Mobile) */}
        <div className={`${showFiltersMobile ? "grid" : "hidden"} sm:grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1`}>
          {/* Type Filter */}
          <div>
            <label className="sm:hidden block text-[10px] font-semibold text-slate-500 mb-1">Jenis Transaksi</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
            >
              <option value="ALL">Semua Jenis (Masuk/Keluar/Transfer)</option>
              <option value="EXPENSE">Pengeluaran</option>
              <option value="INCOME">Pemasukan</option>
              <option value="TRANSFER">Transfer Antar Dompet</option>
            </select>
          </div>

          {/* Wallet Filter */}
          <div>
            <label className="sm:hidden block text-[10px] font-semibold text-slate-500 mb-1">Pilih Dompet</label>
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
            >
              <option value="ALL">Semua Dompet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="sm:hidden block text-[10px] font-semibold text-slate-500 mb-1">Pilih Kategori</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type === "INCOME" ? "Masuk" : "Keluar"})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary & Reset Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Ditemukan <strong className="text-slate-800">{filteredTransactions.length}</strong> transaksi
          </span>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}
        </div>
      </div>

      {/* Transactions Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 sm:p-12 text-center text-slate-400">
            <p className="text-base font-semibold text-slate-600">Tidak ada transaksi ditemukan.</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              Coba sesuaikan filter pencarian atau catat transaksi baru.
            </p>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Transaksi Baru</span>
            </button>
          </div>
        ) : (
          <>
            {/* MOBILE VIEW: Touch-Friendly Responsive Cards (Visible on screens < md) */}
            <div className="block md:hidden divide-y divide-slate-100">
              {filteredTransactions.map((t) => {
                const isExpense = t.type === "EXPENSE";
                const isIncome = t.type === "INCOME";
                const isTransfer = t.type === "TRANSFER";

                return (
                  <div key={t.id} className="p-3.5 sm:p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      {/* Left: Icon & Info */}
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div
                          className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0 mt-0.5 shadow-sm"
                          style={{
                            backgroundColor: isTransfer
                              ? "#3b82f6"
                              : t.category?.color || "#6b7280",
                          }}
                        >
                          {isTransfer ? (
                            <ArrowLeftRight className="w-5 h-5" />
                          ) : (
                            <CategoryIcon
                              name={t.category?.icon || "Tag"}
                              size={18}
                            />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-slate-800 text-sm truncate">
                            {isTransfer
                              ? `Transfer Antar Dompet`
                              : t.category?.name || "Tanpa Kategori"}
                          </p>
                          {t.note && (
                            <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                              {t.note}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                            <span>{formatDateShort(t.transactionDate)}</span>
                            <span>•</span>
                            <span className="font-medium text-slate-600">
                              {isTransfer ? `${t.wallet?.name} ➔ ${t.toWallet?.name}` : t.wallet?.name}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Status */}
                      <div className="text-right flex-shrink-0">
                        <p
                          className={`text-sm sm:text-base font-extrabold ${
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
                        <span
                          className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded mt-1 ${
                            isExpense
                              ? "bg-red-50 text-red-600"
                              : isIncome
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-blue-50 text-blue-700"
                          }`}
                        >
                          {isExpense ? "Pengeluaran" : isIncome ? "Pemasukan" : "Transfer"}
                        </span>
                      </div>
                    </div>

                    {/* Mobile Action Buttons (Footer of card) */}
                    <div className="flex items-center justify-end gap-1 mt-2.5 pt-2 border-t border-slate-50">
                      <button
                        onClick={() => handleEdit(t)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs font-semibold transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        disabled={deletingId === t.id}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                      >
                        {deletingId === t.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP VIEW: Full Table (Visible on screens >= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4">Kategori & Catatan</th>
                    <th className="py-3.5 px-4">Tanggal</th>
                    <th className="py-3.5 px-4">Dompet</th>
                    <th className="py-3.5 px-4 text-right">Nominal</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredTransactions.map((t) => {
                    const isExpense = t.type === "EXPENSE";
                    const isIncome = t.type === "INCOME";
                    const isTransfer = t.type === "TRANSFER";

                    return (
                      <tr
                        key={t.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        {/* Category & Note */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                              style={{
                                backgroundColor: isTransfer
                                  ? "#3b82f6"
                                  : t.category?.color || "#6b7280",
                              }}
                            >
                              {isTransfer ? (
                                <ArrowLeftRight className="w-4 h-4" />
                              ) : (
                                <CategoryIcon
                                  name={t.category?.icon || "Tag"}
                                  size={16}
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {isTransfer
                                  ? `Transfer Antar Dompet`
                                  : t.category?.name || "Tanpa Kategori"}
                              </p>
                              {t.note && (
                                <p className="text-xs text-slate-400 line-clamp-1">
                                  {t.note}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 text-xs text-slate-600 whitespace-nowrap">
                          {formatDateShort(t.transactionDate)}
                        </td>

                        {/* Wallet */}
                        <td className="py-3.5 px-4 text-xs whitespace-nowrap">
                          {isTransfer ? (
                            <div className="flex items-center gap-1.5 font-medium text-slate-700">
                              <span>{t.wallet?.name}</span>
                              <span className="text-slate-400">➔</span>
                              <span>{t.toWallet?.name}</span>
                            </div>
                          ) : (
                            <span className="font-medium text-slate-700">
                              {t.wallet?.name}
                            </span>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <span
                            className={`font-bold ${
                              isExpense
                                ? "text-red-500"
                                : isIncome
                                ? "text-emerald-600"
                                : "text-blue-600"
                            }`}
                          >
                            {isExpense ? "-" : isIncome ? "+" : ""}
                            {formatRupiah(t.amount)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(t)}
                              title="Edit Transaksi"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(t.id)}
                              disabled={deletingId === t.id}
                              title="Hapus Transaksi"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {deletingId === t.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Edit / Add Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        wallets={wallets}
        categories={categories}
        initialData={editingTransaction}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}

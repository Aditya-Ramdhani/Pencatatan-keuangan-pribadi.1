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

  // Calculate totals for filtered list
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "INCOME")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "EXPENSE")
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
            Riwayat Transaksi
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Daftar lengkap transaksi, pencarian, dan penyaringan
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={`/api/export?month=${selectedMonth}`}
            download
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold shadow-sm transition-colors"
          >
            <FileDown className="w-4 h-4 text-slate-500" />
            <span>Ekspor CSV</span>
          </a>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>+ Catat Transaksi</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Filter className="w-4 h-4 text-emerald-600" />
          <span>Filter & Pencarian</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari catatan..."
              className="w-full pl-10 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          {/* Month Filter */}
          <div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            >
              <option value="ALL">Semua Jenis Transaksi</option>
              <option value="EXPENSE">Pengeluaran</option>
              <option value="INCOME">Pemasukan</option>
              <option value="TRANSFER">Transfer Antar Dompet</option>
            </select>
          </div>

          {/* Wallet Filter */}
          <div>
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
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
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
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

        {/* Filter Summary Banner */}
        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="text-slate-500">
            Ditemukan <strong className="text-slate-800">{filteredTransactions.length}</strong> transaksi
          </span>
          <div className="flex items-center gap-4">
            <span className="text-emerald-700 font-semibold">
              Total Masuk: +{formatRupiah(totalIncome)}
            </span>
            <span className="text-red-600 font-semibold">
              Total Keluar: -{formatRupiah(totalExpense)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-base font-semibold text-slate-600">Tidak ada transaksi ditemukan.</p>
            <p className="text-xs text-slate-400 mt-1">
              Coba sesuaikan filter pencarian atau buat transaksi baru.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
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


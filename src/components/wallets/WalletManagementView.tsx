"use client";

import { useState } from "react";
import { formatRupiah } from "@/lib/currency";
import { deleteWallet } from "@/actions/wallets";
import { WalletModal } from "@/components/wallets/WalletModal";
import {
  Wallet,
  Landmark,
  Smartphone,
  MoreHorizontal,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  CreditCard,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface WalletManagementViewProps {
  wallets: any[];
}

export function WalletManagementView({ wallets }: WalletManagementViewProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const getWalletIcon = (type: string) => {
    switch (type) {
      case "BANK":
        return Landmark;
      case "EWALLET":
        return Smartphone;
      case "CASH":
        return Wallet;
      default:
        return CreditCard;
    }
  };

  const handleDelete = async (id: string) => {
    if (wallets.length <= 1) {
      alert("Anda harus memiliki minimal satu dompet utama.");
      return;
    }

    if (
      !confirm(
        "Apakah Anda yakin ingin menghapus dompet ini? Semua riwayat transaksi dompet ini juga akan terhapus."
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteWallet(id);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } catch {
      alert("Gagal menghapus dompet.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (w: any) => {
    setEditingWallet(w);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingWallet(null);
    setIsModalOpen(true);
  };

  const totalBalance = wallets.reduce((acc, w) => acc + w.balance, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
            Dompet & Sumber Dana
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola rekening bank, e-wallet, dan uang tunai Anda
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Dompet</span>
        </button>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-6 text-white shadow-xl shadow-emerald-600/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-emerald-100">
            Total Saldo Semua Dompet
          </span>
          <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mt-1">
            {formatRupiah(totalBalance)}
          </h2>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20 text-xs font-medium text-emerald-50 self-start sm:self-auto">
          {wallets.length} Dompet Terhubung
        </div>
      </div>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {wallets.map((w) => {
          const IconComponent = getWalletIcon(w.type);

          return (
            <div
              key={w.id}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: w.color || "#10b981" }}
                  >
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(w)}
                      title="Edit Dompet"
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(w.id)}
                      disabled={deletingId === w.id || wallets.length <= 1}
                      title="Hapus Dompet"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                    >
                      {deletingId === w.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-slate-800 text-lg">{w.name}</h3>
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full mt-1">
                  {w.type === "BANK"
                    ? "Bank Transfer"
                    : w.type === "EWALLET"
                    ? "Dompet Digital"
                    : w.type === "CASH"
                    ? "Tunai"
                    : "Lainnya"}
                </span>
              </div>

              <div className="pt-6 border-t border-slate-50 mt-6">
                <span className="text-xs text-slate-400 block mb-0.5">Saldo Terkini</span>
                <p className="text-xl font-extrabold text-slate-900">
                  {formatRupiah(w.balance)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <WalletModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingWallet(null);
        }}
        initialData={editingWallet}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}


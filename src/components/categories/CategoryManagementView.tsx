"use client";

import { useState } from "react";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { CategoryModal } from "@/components/categories/CategoryModal";
import { deleteCategory } from "@/actions/categories";
import { Plus, Edit2, Trash2, Loader2, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface CategoryManagementViewProps {
  categories: any[];
}

export function CategoryManagementView({ categories }: CategoryManagementViewProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = categories.filter((c) => c.type === activeTab);

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteCategory(id);
      if (res?.error) {
        alert(res.error);
      } else {
        router.refresh();
      }
    } catch {
      alert("Gagal menghapus kategori.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (c: any) => {
    setEditingCategory(c);
    setIsModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-800 tracking-tight">
            Kategori Transaksi
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Sesuaikan kategori pemasukan dan pengeluaran sesuai kebutuhan Anda
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-md shadow-emerald-600/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tambah Kategori</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("EXPENSE")}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "EXPENSE"
              ? "border-red-500 text-red-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ArrowDownRight className="w-4 h-4" />
          <span>Pengeluaran ({categories.filter((c) => c.type === "EXPENSE").length})</span>
        </button>
        <button
          onClick={() => setActiveTab("INCOME")}
          className={`flex items-center gap-2 pb-3 px-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "INCOME"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <ArrowUpRight className="w-4 h-4" />
          <span>Pemasukan ({categories.filter((c) => c.type === "INCOME").length})</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white flex-shrink-0"
                style={{ backgroundColor: c.color }}
              >
                <CategoryIcon name={c.icon} size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">{c.name}</h4>
                <span className="text-[10px] text-slate-400 font-medium">
                  {c.type === "EXPENSE" ? "Pos Pengeluaran" : "Pos Pemasukan"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEdit(c)}
                title="Edit Kategori"
                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                disabled={deletingId === c.id}
                title="Hapus Kategori"
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {deletingId === c.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        initialData={editingCategory}
        onSuccess={() => router.refresh()}
      />
    </div>
  );
}


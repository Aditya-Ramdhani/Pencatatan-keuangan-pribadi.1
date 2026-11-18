import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export const loginSchema = z.object({
  email: z.string().email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const walletSchema = z.object({
  name: z.string().min(1, "Nama dompet wajib diisi"),
  type: z.enum(["CASH", "BANK", "EWALLET", "OTHER"]),
  balance: z.number().min(0, "Saldo tidak boleh negatif"),
  color: z.string().optional().default("#10b981"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Nama kategori wajib diisi"),
  type: z.enum(["INCOME", "EXPENSE"]),
  icon: z.string().min(1, "Ikon wajib dipilih"),
  color: z.string().min(1, "Warna wajib dipilih"),
});

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE", "TRANSFER"]),
  amount: z.number().positive("Nominal harus lebih dari 0"),
  walletId: z.string().uuid("Dompet sumber tidak valid"),
  toWalletId: z.string().uuid("Dompet tujuan tidak valid").optional().nullable(),
  categoryId: z.string().uuid("Kategori tidak valid").optional().nullable(),
  transactionDate: z.string().or(z.date()),
  note: z.string().optional().nullable(),
});

export const budgetSchema = z.object({
  categoryId: z.string().uuid("Kategori tidak valid"),
  month: z.string().regex(/^\d{4}-\d{2}$/, "Format bulan harus YYYY-MM"),
  amount: z.number().positive("Batas anggaran harus lebih dari 0"),
});


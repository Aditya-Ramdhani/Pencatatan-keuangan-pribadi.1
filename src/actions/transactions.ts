"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { transactionSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export interface TransactionFilterParams {
  search?: string;
  type?: "INCOME" | "EXPENSE" | "TRANSFER" | "ALL";
  walletId?: string;
  categoryId?: string;
  month?: string; // "YYYY-MM"
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export async function getTransactions(filters: TransactionFilterParams = {}) {
  const session = await getSession();
  if (!session) return [];

  const { search, type, walletId, categoryId, month, startDate, endDate, limit } = filters;

  // Build where conditions
  const where: any = {
    userId: session.userId,
  };

  if (type && type !== "ALL") {
    where.type = type;
  }

  if (walletId && walletId !== "ALL") {
    where.OR = [
      { walletId: walletId },
      { toWalletId: walletId },
    ];
  }

  if (categoryId && categoryId !== "ALL") {
    where.categoryId = categoryId;
  }

  if (search) {
    where.note = {
      contains: search,
    };
  }

  if (month) {
    const [year, m] = month.split("-").map(Number);
    const startOfMonth = new Date(Date.UTC(year, m - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, m, 0, 23, 59, 59, 999));
    where.transactionDate = {
      gte: startOfMonth,
      lte: endOfMonth,
    };
  } else if (startDate || endDate) {
    where.transactionDate = {};
    if (startDate) {
      where.transactionDate.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.transactionDate.lte = end;
    }
  }

  return prisma.transaction.findMany({
    where,
    include: {
      wallet: true,
      toWallet: true,
      category: true,
    },
    orderBy: {
      transactionDate: "desc",
    },
    take: limit,
  });
}

export async function createTransaction(formData: unknown) {
  const session = await getSession();
  if (!session) return { error: "Silakan login terlebih dahulu." };

  const parsed = transactionSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Data transaksi tidak valid" };
  }

  const { type, amount, walletId, toWalletId, categoryId, transactionDate, note } = parsed.data;

  try {
    const dateObj = new Date(transactionDate);

    // Atomic transaction for both transaction creation and wallet balance update
    const result = await prisma.$transaction(async (tx) => {
      // 1. Verify source wallet belongs to user
      const sourceWallet = await tx.wallet.findFirst({
        where: { id: walletId, userId: session.userId },
      });
      if (!sourceWallet) throw new Error("Dompet sumber tidak ditemukan.");

      // 2. If transfer, verify destination wallet
      if (type === "TRANSFER") {
        if (!toWalletId) throw new Error("Dompet tujuan transfer wajib dipilih.");
        if (toWalletId === walletId) throw new Error("Dompet tujuan tidak boleh sama dengan dompet asal.");
        const destWallet = await tx.wallet.findFirst({
          where: { id: toWalletId, userId: session.userId },
        });
        if (!destWallet) throw new Error("Dompet tujuan tidak ditemukan.");

        // Deduct from source, add to destination
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { decrement: amount } },
        });
        await tx.wallet.update({
          where: { id: toWalletId },
          data: { balance: { increment: amount } },
        });
      } else if (type === "EXPENSE") {
        // Deduct from wallet
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { decrement: amount } },
        });
      } else if (type === "INCOME") {
        // Add to wallet
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { increment: amount } },
        });
      }

      // 3. Create transaction record
      const newTransaction = await tx.transaction.create({
        data: {
          userId: session.userId,
          walletId,
          toWalletId: type === "TRANSFER" ? toWalletId : null,
          categoryId: type === "TRANSFER" ? null : categoryId,
          type,
          amount,
          note: note || null,
          transactionDate: dateObj,
        },
      });

      return newTransaction;
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/wallets");
    revalidatePath("/budgets");
    return { success: true, transaction: result };
  } catch (error: any) {
    console.error("Create transaction error:", error);
    return { error: error.message || "Gagal menyimpan transaksi." };
  }
}

export async function deleteTransaction(id: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan login terlebih dahulu." };

  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findFirst({
        where: { id, userId: session.userId },
      });
      if (!existing) throw new Error("Transaksi tidak ditemukan.");

      // Reverse balance changes
      if (existing.type === "EXPENSE") {
        await tx.wallet.update({
          where: { id: existing.walletId },
          data: { balance: { increment: existing.amount } },
        });
      } else if (existing.type === "INCOME") {
        await tx.wallet.update({
          where: { id: existing.walletId },
          data: { balance: { decrement: existing.amount } },
        });
      } else if (existing.type === "TRANSFER" && existing.toWalletId) {
        // Revert source
        await tx.wallet.update({
          where: { id: existing.walletId },
          data: { balance: { increment: existing.amount } },
        });
        // Revert destination
        await tx.wallet.update({
          where: { id: existing.toWalletId },
          data: { balance: { decrement: existing.amount } },
        });
      }

      // Delete the transaction record
      await tx.transaction.delete({
        where: { id },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/wallets");
    revalidatePath("/budgets");
    return { success: true };
  } catch (error: any) {
    console.error("Delete transaction error:", error);
    return { error: error.message || "Gagal menghapus transaksi." };
  }
}

export async function updateTransaction(id: string, formData: unknown) {
  const session = await getSession();
  if (!session) return { error: "Silakan login terlebih dahulu." };

  const parsed = transactionSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Data transaksi tidak valid" };
  }

  const { type, amount, walletId, toWalletId, categoryId, transactionDate, note } = parsed.data;

  try {
    const dateObj = new Date(transactionDate);

    await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findFirst({
        where: { id, userId: session.userId },
      });
      if (!existing) throw new Error("Transaksi tidak ditemukan.");

      // 1. Revert existing transaction balances
      if (existing.type === "EXPENSE") {
        await tx.wallet.update({
          where: { id: existing.walletId },
          data: { balance: { increment: existing.amount } },
        });
      } else if (existing.type === "INCOME") {
        await tx.wallet.update({
          where: { id: existing.walletId },
          data: { balance: { decrement: existing.amount } },
        });
      } else if (existing.type === "TRANSFER" && existing.toWalletId) {
        await tx.wallet.update({
          where: { id: existing.walletId },
          data: { balance: { increment: existing.amount } },
        });
        await tx.wallet.update({
          where: { id: existing.toWalletId },
          data: { balance: { decrement: existing.amount } },
        });
      }

      // 2. Apply new transaction balances
      if (type === "TRANSFER") {
        if (!toWalletId) throw new Error("Dompet tujuan transfer wajib dipilih.");
        if (toWalletId === walletId) throw new Error("Dompet tujuan tidak boleh sama dengan dompet asal.");

        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { decrement: amount } },
        });
        await tx.wallet.update({
          where: { id: toWalletId },
          data: { balance: { increment: amount } },
        });
      } else if (type === "EXPENSE") {
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { decrement: amount } },
        });
      } else if (type === "INCOME") {
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { increment: amount } },
        });
      }

      // 3. Update transaction record
      await tx.transaction.update({
        where: { id },
        data: {
          walletId,
          toWalletId: type === "TRANSFER" ? toWalletId : null,
          categoryId: type === "TRANSFER" ? null : categoryId,
          type,
          amount,
          note: note || null,
          transactionDate: dateObj,
        },
      });
    });

    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    revalidatePath("/wallets");
    revalidatePath("/budgets");
    return { success: true };
  } catch (error: any) {
    console.error("Update transaction error:", error);
    return { error: error.message || "Gagal memperbarui transaksi." };
  }
}


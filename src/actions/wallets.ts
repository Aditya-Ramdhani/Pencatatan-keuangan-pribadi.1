"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { walletSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getWallets() {
  const session = await getSession();
  if (!session) return [];

  return prisma.wallet.findMany({
    where: { userId: session.userId },
    orderBy: { createdAt: "asc" },
  });
}

export async function createWallet(formData: unknown) {
  const session = await getSession();
  if (!session) return { error: "Silakan login terlebih dahulu." };

  const parsed = walletSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Data dompet tidak valid" };
  }

  const { name, type, balance, color } = parsed.data;

  try {
    const wallet = await prisma.wallet.create({
      data: {
        userId: session.userId,
        name,
        type,
        balance,
        color: color || "#10b981",
      },
    });

    revalidatePath("/wallets");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return { success: true, wallet };
  } catch (error) {
    console.error("Create wallet error:", error);
    return { error: "Gagal membuat dompet baru." };
  }
}

export async function updateWallet(id: string, formData: unknown) {
  const session = await getSession();
  if (!session) return { error: "Silakan login terlebih dahulu." };

  const parsed = walletSchema.partial().safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Data dompet tidak valid" };
  }

  try {
    const existing = await prisma.wallet.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) return { error: "Dompet tidak ditemukan." };

    await prisma.wallet.update({
      where: { id },
      data: parsed.data,
    });

    revalidatePath("/wallets");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    console.error("Update wallet error:", error);
    return { error: "Gagal memperbarui dompet." };
  }
}

export async function deleteWallet(id: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan login terlebih dahulu." };

  try {
    const existing = await prisma.wallet.findFirst({
      where: { id, userId: session.userId },
    });
    if (!existing) return { error: "Dompet tidak ditemukan." };

    // Check count of user wallets
    const totalWallets = await prisma.wallet.count({
      where: { userId: session.userId },
    });
    if (totalWallets <= 1) {
      return { error: "Anda harus memiliki minimal satu dompet utama." };
    }

    await prisma.wallet.delete({
      where: { id },
    });

    revalidatePath("/wallets");
    revalidatePath("/dashboard");
    revalidatePath("/transactions");
    return { success: true };
  } catch (error) {
    console.error("Delete wallet error:", error);
    return { error: "Gagal menghapus dompet." };
  }
}


"use server";

import prisma from "@/lib/prisma";
import { hashPassword, comparePassword, setSessionCookie, clearSessionCookie, getSession } from "@/lib/auth";
import { registerSchema, loginSchema } from "@/lib/validations";
import { redirect } from "next/navigation";

// Kategori default yang langsung di-seed untuk setiap pengguna baru
const DEFAULT_CATEGORIES = [
  // Pengeluaran
  { name: "Makan & Minum", type: "EXPENSE", icon: "Utensils", color: "#f97316" },
  { name: "Transportasi", type: "EXPENSE", icon: "Car", color: "#3b82f6" },
  { name: "Tagihan & Utilitas", type: "EXPENSE", icon: "Receipt", color: "#ef4444" },
  { name: "Belanja", type: "EXPENSE", icon: "ShoppingBag", color: "#ec4899" },
  { name: "Hiburan", type: "EXPENSE", icon: "Gamepad2", color: "#8b5cf6" },
  { name: "Kesehatan", type: "EXPENSE", icon: "HeartPulse", color: "#14b8a6" },
  { name: "Lainnya", type: "EXPENSE", icon: "MoreHorizontal", color: "#6b7280" },
  // Pemasukan
  { name: "Gaji", type: "INCOME", icon: "Banknote", color: "#10b981" },
  { name: "Bonus", type: "INCOME", icon: "Award", color: "#f59e0b" },
  { name: "Investasi", type: "INCOME", icon: "TrendingUp", color: "#6366f1" },
  { name: "Hadiah", type: "INCOME", icon: "Gift", color: "#06b6d4" },
];

export async function registerAction(formData: unknown) {
  const parsed = registerSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Input tidak valid" };
  }

  const { name, email, password } = parsed.data;

  try {
    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      return { error: "Email sudah terdaftar. Silakan gunakan email lain atau login." };
    }

    const passwordHash = await hashPassword(password);

    // Create user along with default wallet and default categories in transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
        },
      });

      // Default wallet
      await tx.wallet.create({
        data: {
          userId: user.id,
          name: "Dompet Utama (Tunai)",
          type: "CASH",
          balance: 0,
          color: "#10b981",
        },
      });

      // Default categories
      await tx.category.createMany({
        data: DEFAULT_CATEGORIES.map((cat) => ({
          userId: user.id,
          name: cat.name,
          type: cat.type,
          icon: cat.icon,
          color: cat.color,
        })),
      });

      return user;
    });

    await setSessionCookie({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
    });
  } catch (error) {
    console.error("Register error:", error);
    return { error: "Terjadi kesalahan sistem saat mendaftarkan akun." };
  }

  redirect("/dashboard");
}

export async function loginAction(formData: unknown) {
  const parsed = loginSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Input tidak valid" };
  }

  const { email, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.passwordHash) {
      return { error: "Email atau password salah." };
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return { error: "Email atau password salah." };
    }

    await setSessionCookie({
      userId: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Login error:", error);
    return { error: "Terjadi kesalahan saat proses login." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { id: true, name: true, email: true, createdAt: true },
    });
    return user;
  } catch {
    return null;
  }
}


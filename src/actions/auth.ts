"use server";

import prisma from "@/lib/prisma";
import { hashPassword, comparePassword, setSessionCookie, clearSessionCookie, getSession } from "@/lib/auth";
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@/lib/validations";
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
          failedAttempts: 0,
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

    // 1. Cek apakah akun sedang terkunci karena salah 5 kali
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const minutesLeft = Math.ceil(
        (user.lockedUntil.getTime() - Date.now()) / (60 * 1000)
      );
      return {
        error: `Akun Anda terkunci sementara karena salah password 5 kali berturut-turut. Silakan coba lagi dalam ${minutesLeft} menit atau reset password Anda.`,
        isLocked: true,
        failedAttempts: user.failedAttempts,
      };
    }

    // 2. Cek kecocokan password
    const isValid = await comparePassword(password, user.passwordHash);

    if (!isValid) {
      const currentAttempts = (user.failedAttempts || 0) + 1;

      if (currentAttempts >= 5) {
        // Kunci akun selama 15 menit
        const lockDuration = new Date(Date.now() + 15 * 60 * 1000);
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedAttempts: currentAttempts,
            lockedUntil: lockDuration,
          },
        });

        return {
          error:
            "Anda telah salah memasukkan password sebanyak 5 kali. Akun Anda terkunci sementara selama 15 menit untuk alasan keamanan. Silakan gunakan opsi Reset Password di bawah.",
          isLocked: true,
          failedAttempts: currentAttempts,
        };
      } else {
        // Catat jumlah kesalahan
        await prisma.user.update({
          where: { id: user.id },
          data: { failedAttempts: currentAttempts },
        });

        const remaining = 5 - currentAttempts;
        return {
          error: `Email atau password salah. (Peringatan: Sisa kesempatan mencoba ${remaining} kali sebelum akun terkunci).`,
          failedAttempts: currentAttempts,
          isLocked: false,
        };
      }
    }

    // 3. Login sukses: Reset counter kesalahan
    if (user.failedAttempts > 0 || user.lockedUntil) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedAttempts: 0,
          lockedUntil: null,
        },
      });
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

export async function requestPasswordResetAction(formData: unknown) {
  const parsed = forgotPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Format email tidak valid" };
  }

  const { email } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { error: "Alamat email tidak ditemukan dalam sistem." };
    }

    // Buat kode verifikasi 6 digit acak
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 menit

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetCode: code,
        resetCodeExpires: expiresAt,
      },
    });

    return {
      success: true,
      email: user.email,
      code, // Disediakan juga di response agar verifikasi bisa dilakukan langsung tanpa terhalang settingan SMTP
      message: "Kode verifikasi 6 digit telah berhasil dibuat.",
    };
  } catch (error) {
    console.error("Request reset error:", error);
    return { error: "Gagal memproses permintaan reset password." };
  }
}

export async function resetPasswordAction(formData: unknown) {
  const parsed = resetPasswordSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Data tidak valid" };
  }

  const { email, code, password } = parsed.data;

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { error: "Pengguna tidak ditemukan." };
    }

    if (!user.resetCode || user.resetCode !== code) {
      return { error: "Kode verifikasi salah. Silakan periksa kembali kode Anda." };
    }

    if (!user.resetCodeExpires || user.resetCodeExpires < new Date()) {
      return { error: "Kode verifikasi telah kedaluwarsa. Silakan minta kode baru." };
    }

    const passwordHash = await hashPassword(password);

    // Reset password & buka kembali akun jika terkunci
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        failedAttempts: 0,
        lockedUntil: null,
        resetCode: null,
        resetCodeExpires: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Gagal memperbarui password." };
  }
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

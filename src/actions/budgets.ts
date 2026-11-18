"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { budgetSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";

export async function getBudgets(month: string) {
  const session = await getSession();
  if (!session) return [];

  // Parse month date range
  const [year, m] = month.split("-").map(Number);
  const startOfMonth = new Date(Date.UTC(year, m - 1, 1, 0, 0, 0));
  const endOfMonth = new Date(Date.UTC(year, m, 0, 23, 59, 59, 999));

  // Get budgets for this month
  const budgets = await prisma.budget.findMany({
    where: {
      userId: session.userId,
      month,
    },
    include: {
      category: true,
    },
    orderBy: {
      amount: "desc",
    },
  });

  // Calculate actual spending for each category in this month
  const spendingByCategory = await prisma.transaction.groupBy({
    by: ["categoryId"],
    where: {
      userId: session.userId,
      type: "EXPENSE",
      transactionDate: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
      categoryId: {
        not: null,
      },
    },
    _sum: {
      amount: true,
    },
  });

  const spendingMap = new Map<string, number>();
  spendingByCategory.forEach((item) => {
    if (item.categoryId) {
      spendingMap.set(item.categoryId, item._sum.amount || 0);
    }
  });

  return budgets.map((b) => {
    const spent = spendingMap.get(b.categoryId) || 0;
    const percentage = b.amount > 0 ? (spent / b.amount) * 100 : 0;
    const remaining = b.amount - spent;
    let status: "normal" | "warning" | "exceeded" = "normal";

    if (percentage >= 100) {
      status = "exceeded";
    } else if (percentage >= 80) {
      status = "warning";
    }

    return {
      id: b.id,
      categoryId: b.categoryId,
      categoryName: b.category.name,
      categoryColor: b.category.color,
      categoryIcon: b.category.icon,
      month: b.month,
      limitAmount: b.amount,
      spentAmount: spent,
      remainingAmount: remaining,
      percentage: Math.min(percentage, 100),
      rawPercentage: percentage,
      status,
    };
  });
}

export async function setBudget(formData: unknown) {
  const session = await getSession();
  if (!session) return { error: "Silakan login terlebih dahulu." };

  const parsed = budgetSchema.safeParse(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Data anggaran tidak valid" };
  }

  const { categoryId, month, amount } = parsed.data;

  try {
    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month: {
          userId: session.userId,
          categoryId,
          month,
        },
      },
      update: {
        amount,
      },
      create: {
        userId: session.userId,
        categoryId,
        month,
        amount,
      },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    return { success: true, budget };
  } catch (error) {
    console.error("Set budget error:", error);
    return { error: "Gagal menyimpan batas anggaran." };
  }
}

export async function deleteBudget(id: string) {
  const session = await getSession();
  if (!session) return { error: "Silakan login terlebih dahulu." };

  try {
    await prisma.budget.delete({
      where: { id, userId: session.userId },
    });

    revalidatePath("/budgets");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Delete budget error:", error);
    return { error: "Gagal menghapus batas anggaran." };
  }
}


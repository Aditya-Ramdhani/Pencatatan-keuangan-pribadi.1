"use server";

import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function getDashboardData() {
  const session = await getSession();
  if (!session) return null;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth(); // 0-based

  // Current Month Date Range
  const startOfCurrentMonth = new Date(Date.UTC(currentYear, currentMonthIndex, 1, 0, 0, 0));
  const endOfCurrentMonth = new Date(Date.UTC(currentYear, currentMonthIndex + 1, 0, 23, 59, 59, 999));

  // Previous Month Date Range
  const startOfPrevMonth = new Date(Date.UTC(currentYear, currentMonthIndex - 1, 1, 0, 0, 0));
  const endOfPrevMonth = new Date(Date.UTC(currentYear, currentMonthIndex, 0, 23, 59, 59, 999));

  // 1. Wallets & Total Combined Balance
  const wallets = await prisma.wallet.findMany({
    where: { userId: session.userId },
    orderBy: { balance: "desc" },
  });

  const totalBalance = wallets.reduce((acc, curr) => acc + curr.balance, 0);

  // 2. Current Month Income & Expense
  const currentMonthTransactions = await prisma.transaction.findMany({
    where: {
      userId: session.userId,
      transactionDate: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth,
      },
    },
    include: {
      category: true,
      wallet: true,
    },
  });

  let currentIncome = 0;
  let currentExpense = 0;

  currentMonthTransactions.forEach((t) => {
    if (t.type === "INCOME") currentIncome += t.amount;
    if (t.type === "EXPENSE") currentExpense += t.amount;
  });

  const netCashFlow = currentIncome - currentExpense;

  // 3. Previous Month Income & Expense for percentage comparison
  const prevMonthTransactions = await prisma.transaction.findMany({
    where: {
      userId: session.userId,
      transactionDate: {
        gte: startOfPrevMonth,
        lte: endOfPrevMonth,
      },
    },
  });

  let prevIncome = 0;
  let prevExpense = 0;

  prevMonthTransactions.forEach((t) => {
    if (t.type === "INCOME") prevIncome += t.amount;
    if (t.type === "EXPENSE") prevExpense += t.amount;
  });

  const incomeGrowth = prevIncome > 0 ? ((currentIncome - prevIncome) / prevIncome) * 100 : 0;
  const expenseGrowth = prevExpense > 0 ? ((currentExpense - prevExpense) / prevExpense) * 100 : 0;

  // 4. Bar Chart: Last 6 Months Cash Flow
  // Months list: from (currentMonth - 5) to currentMonth
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const sixMonthsRangeStart = new Date(Date.UTC(currentYear, currentMonthIndex - 5, 1, 0, 0, 0));

  const lastSixMonthsTransactions = await prisma.transaction.findMany({
    where: {
      userId: session.userId,
      transactionDate: {
        gte: sixMonthsRangeStart,
        lte: endOfCurrentMonth,
      },
      type: {
        in: ["INCOME", "EXPENSE"],
      },
    },
    select: {
      type: true,
      amount: true,
      transactionDate: true,
    },
  });

  // Group by "YYYY-MM"
  const monthlyFlowMap = new Map<string, { income: number; expense: number; label: string }>();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(currentYear, currentMonthIndex - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const label = `${monthNames[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(-2)}`;
    monthlyFlowMap.set(key, { income: 0, expense: 0, label });
  }

  lastSixMonthsTransactions.forEach((t) => {
    const d = new Date(t.transactionDate);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    const entry = monthlyFlowMap.get(key);
    if (entry) {
      if (t.type === "INCOME") entry.income += t.amount;
      if (t.type === "EXPENSE") entry.expense += t.amount;
    }
  });

  const cashFlowChartData = Array.from(monthlyFlowMap.values());

  // 5. Donut Chart: Expense Breakdown by Category (Current Month)
  const categoryExpenseMap = new Map<string, { name: string; color: string; amount: number }>();

  currentMonthTransactions.forEach((t) => {
    if (t.type === "EXPENSE" && t.category) {
      const existing = categoryExpenseMap.get(t.category.id) || {
        name: t.category.name,
        color: t.category.color || "#6b7280",
        amount: 0,
      };
      existing.amount += t.amount;
      categoryExpenseMap.set(t.category.id, existing);
    }
  });

  const categoryExpenses = Array.from(categoryExpenseMap.values())
    .sort((a, b) => b.amount - a.amount)
    .map((item) => ({
      ...item,
      percentage: currentExpense > 0 ? (item.amount / currentExpense) * 100 : 0,
    }));

  // 6. Recent 5 Transactions
  const recentTransactions = await prisma.transaction.findMany({
    where: { userId: session.userId },
    include: {
      category: true,
      wallet: true,
      toWallet: true,
    },
    orderBy: {
      transactionDate: "desc",
    },
    take: 5,
  });

  // 7. Active Budgets for current month
  const currentMonthKey = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}`;
  const budgets = await prisma.budget.findMany({
    where: {
      userId: session.userId,
      month: currentMonthKey,
    },
    include: {
      category: true,
    },
  });

  const budgetProgress = budgets.map((b) => {
    const catExpense = categoryExpenseMap.get(b.categoryId)?.amount || 0;
    const percentage = b.amount > 0 ? (catExpense / b.amount) * 100 : 0;
    const status: "normal" | "warning" | "exceeded" =
      percentage >= 100 ? "exceeded" : percentage >= 80 ? "warning" : "normal";

    return {
      id: b.id,
      categoryName: b.category.name,
      categoryColor: b.category.color,
      categoryIcon: b.category.icon,
      limitAmount: b.amount,
      spentAmount: catExpense,
      percentage: Math.min(percentage, 100),
      rawPercentage: percentage,
      status,
    };
  });

  return {
    user: {
      name: session.name,
      email: session.email,
    },
    kpi: {
      totalBalance,
      currentIncome,
      currentExpense,
      netCashFlow,
      incomeGrowth,
      expenseGrowth,
    },
    wallets,
    cashFlowChartData,
    categoryExpenses,
    recentTransactions,
    budgetProgress,
    currentMonthName: `${monthNames[currentMonthIndex]} ${currentYear}`,
    currentMonthKey,
  };
}

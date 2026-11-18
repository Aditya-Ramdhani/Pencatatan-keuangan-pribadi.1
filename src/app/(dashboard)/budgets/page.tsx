import { getBudgets } from "@/actions/budgets";
import { getCategories } from "@/actions/categories";
import { getCurrentMonthString } from "@/lib/currency";
import { BudgetManagementView } from "@/components/budgets/BudgetManagementView";

interface BudgetsPageProps {
  searchParams: {
    month?: string;
  };
}

export default async function BudgetsPage({ searchParams }: BudgetsPageProps) {
  const month = searchParams.month || getCurrentMonthString();

  const [budgets, categories] = await Promise.all([
    getBudgets(month),
    getCategories("EXPENSE"),
  ]);

  return (
    <BudgetManagementView
      budgets={budgets}
      categories={categories}
      currentMonth={month}
    />
  );
}


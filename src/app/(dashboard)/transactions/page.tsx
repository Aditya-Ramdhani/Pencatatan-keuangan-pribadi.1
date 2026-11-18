import { getTransactions } from "@/actions/transactions";
import { getWallets } from "@/actions/wallets";
import { getCategories } from "@/actions/categories";
import { getCurrentMonthString } from "@/lib/currency";
import { TransactionManagementView } from "@/components/transactions/TransactionManagementView";

export default async function TransactionsPage() {
  const currentMonth = getCurrentMonthString();
  const [transactions, wallets, categories] = await Promise.all([
    getTransactions(),
    getWallets(),
    getCategories(),
  ]);

  return (
    <TransactionManagementView
      initialTransactions={transactions}
      wallets={wallets}
      categories={categories}
      currentMonth={currentMonth}
    />
  );
}


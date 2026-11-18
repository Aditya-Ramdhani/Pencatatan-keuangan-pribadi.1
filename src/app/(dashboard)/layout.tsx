import { redirect } from "next/navigation";
import { getCurrentUser } from "@/actions/auth";
import { getWallets } from "@/actions/wallets";
import { getCategories } from "@/actions/categories";
import { DashboardShell } from "@/components/layout/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const [wallets, categories] = await Promise.all([
    getWallets(),
    getCategories(),
  ]);

  return (
    <DashboardShell user={user} wallets={wallets} categories={categories}>
      {children}
    </DashboardShell>
  );
}


import { getWallets } from "@/actions/wallets";
import { WalletManagementView } from "@/components/wallets/WalletManagementView";

export default async function WalletsPage() {
  const wallets = await getWallets();

  return <WalletManagementView wallets={wallets} />;
}


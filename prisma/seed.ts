import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding initial demo data...");

  // Delete existing demo user if exists
  const existingUser = await prisma.user.findUnique({
    where: { email: "demo@fintrack.id" },
  });

  if (existingUser) {
    await prisma.user.delete({
      where: { id: existingUser.id },
    });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("password123", salt);

  const user = await prisma.user.create({
    data: {
      name: "Budi Hartono",
      email: "demo@fintrack.id",
      passwordHash,
    },
  });

  console.log(`Created demo user: ${user.email} (Password: password123)`);

  // Create Wallets
  const walletBCA = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: "Bank BCA",
      type: "BANK",
      balance: 8500000,
      color: "#3b82f6",
    },
  });

  const walletGoPay = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: "GoPay",
      type: "EWALLET",
      balance: 650000,
      color: "#06b6d4",
    },
  });

  const walletCash = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: "Dompet Tunai",
      type: "CASH",
      balance: 450000,
      color: "#10b981",
    },
  });

  // Create Categories
  const catGaji = await prisma.category.create({
    data: {
      userId: user.id,
      name: "Gaji",
      type: "INCOME",
      icon: "Banknote",
      color: "#10b981",
    },
  });

  const catBonus = await prisma.category.create({
    data: {
      userId: user.id,
      name: "Bonus Proyek",
      type: "INCOME",
      icon: "Award",
      color: "#f59e0b",
    },
  });

  const catMakan = await prisma.category.create({
    data: {
      userId: user.id,
      name: "Makan & Minum",
      type: "EXPENSE",
      icon: "Utensils",
      color: "#f97316",
    },
  });

  const catTrans = await prisma.category.create({
    data: {
      userId: user.id,
      name: "Transportasi",
      type: "EXPENSE",
      icon: "Car",
      color: "#3b82f6",
    },
  });

  const catTagihan = await prisma.category.create({
    data: {
      userId: user.id,
      name: "Tagihan & Utilitas",
      type: "EXPENSE",
      icon: "Receipt",
      color: "#ef4444",
    },
  });

  const catBelanja = await prisma.category.create({
    data: {
      userId: user.id,
      name: "Belanja Bulanan",
      type: "EXPENSE",
      icon: "ShoppingBag",
      color: "#ec4899",
    },
  });

  const catHiburan = await prisma.category.create({
    data: {
      userId: user.id,
      name: "Hiburan & Streaming",
      type: "EXPENSE",
      icon: "Gamepad2",
      color: "#8b5cf6",
    },
  });

  // Create Transactions for current month and previous months
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  // Month 0 (Current)
  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        walletId: walletBCA.id,
        categoryId: catGaji.id,
        type: "INCOME",
        amount: 10000000,
        note: "Gaji Pokok Bulanan",
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 1, 9, 0),
      },
      {
        userId: user.id,
        walletId: walletBCA.id,
        categoryId: catBonus.id,
        type: "INCOME",
        amount: 2500000,
        note: "Bonus Kinerja Proyek",
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 10, 14, 0),
      },
      {
        userId: user.id,
        walletId: walletBCA.id,
        categoryId: catBelanja.id,
        type: "EXPENSE",
        amount: 1250000,
        note: "Belanja Kebutuhan Rumah",
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 3, 11, 0),
      },
      {
        userId: user.id,
        walletId: walletBCA.id,
        categoryId: catTagihan.id,
        type: "EXPENSE",
        amount: 450000,
        note: "Tagihan Listrik & Air PLN",
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 5, 8, 30),
      },
      {
        userId: user.id,
        walletId: walletGoPay.id,
        categoryId: catMakan.id,
        type: "EXPENSE",
        amount: 120000,
        note: "Pesan Makan Malam GrabFood",
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 7, 19, 0),
      },
      {
        userId: user.id,
        walletId: walletGoPay.id,
        categoryId: catTrans.id,
        type: "EXPENSE",
        amount: 45000,
        note: "Ojek Online ke Kantor",
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 12, 8, 15),
      },
      {
        userId: user.id,
        walletId: walletBCA.id,
        categoryId: catHiburan.id,
        type: "EXPENSE",
        amount: 186000,
        note: "Langganan Netflix Premium",
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 14, 10, 0),
      },
      {
        userId: user.id,
        walletId: walletCash.id,
        categoryId: catMakan.id,
        type: "EXPENSE",
        amount: 35000,
        note: "Makan Siang Nasi Padang",
        transactionDate: new Date(now.getFullYear(), now.getMonth(), 15, 12, 30),
      },
    ],
  });

  // Transfer transaction: Top up GoPay from BCA
  await prisma.transaction.create({
    data: {
      userId: user.id,
      walletId: walletBCA.id,
      toWalletId: walletGoPay.id,
      type: "TRANSFER",
      amount: 500000,
      note: "Top up GoPay untuk ongkos & jajan",
      transactionDate: new Date(now.getFullYear(), now.getMonth(), 2, 10, 0),
    },
  });

  // Past Months Transactions (for 6-month chart comparison)
  for (let i = 1; i <= 5; i++) {
    const pastDate = new Date(now.getFullYear(), now.getMonth() - i, 15);
    await prisma.transaction.createMany({
      data: [
        {
          userId: user.id,
          walletId: walletBCA.id,
          categoryId: catGaji.id,
          type: "INCOME",
          amount: 9500000 + i * 100000,
          note: "Gaji Bulanan",
          transactionDate: pastDate,
        },
        {
          userId: user.id,
          walletId: walletBCA.id,
          categoryId: catBelanja.id,
          type: "EXPENSE",
          amount: 3000000 + (i % 2) * 500000,
          note: "Pengeluaran Rutin",
          transactionDate: pastDate,
        },
      ],
    });
  }

  // Create Monthly Budgets
  await prisma.budget.createMany({
    data: [
      {
        userId: user.id,
        categoryId: catMakan.id,
        month: currentMonthStr,
        amount: 1500000,
      },
      {
        userId: user.id,
        categoryId: catBelanja.id,
        month: currentMonthStr,
        amount: 2000000,
      },
      {
        userId: user.id,
        categoryId: catHiburan.id,
        month: currentMonthStr,
        amount: 400000,
      },
      {
        userId: user.id,
        categoryId: catTagihan.id,
        month: currentMonthStr,
        amount: 600000,
      },
    ],
  });

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


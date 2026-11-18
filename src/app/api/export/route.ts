import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month"); // optional "YYYY-MM"

  const where: any = {
    userId: session.userId,
  };

  if (month) {
    const [year, m] = month.split("-").map(Number);
    const startOfMonth = new Date(Date.UTC(year, m - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, m, 0, 23, 59, 59, 999));
    where.transactionDate = {
      gte: startOfMonth,
      lte: endOfMonth,
    };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      wallet: true,
      toWallet: true,
      category: true,
    },
    orderBy: {
      transactionDate: "desc",
    },
  });

  // Generate CSV Header
  const headers = ["ID", "Tanggal", "Tipe", "Nominal (IDR)", "Dompet Asal", "Dompet Tujuan", "Kategori", "Catatan"];
  
  // Format rows
  const rows = transactions.map((t) => {
    const dateStr = new Date(t.transactionDate).toISOString().split("T")[0];
    const typeLabel = t.type === "INCOME" ? "Pemasukan" : t.type === "EXPENSE" ? "Pengeluaran" : "Transfer";
    const walletName = `"${(t.wallet?.name || "").replace(/"/g, '""')}"`;
    const toWalletName = `"${(t.toWallet?.name || "").replace(/"/g, '""')}"`;
    const catName = `"${(t.category?.name || "").replace(/"/g, '""')}"`;
    const note = `"${(t.note || "").replace(/"/g, '""')}"`;

    return [
      t.id,
      dateStr,
      typeLabel,
      t.amount,
      walletName,
      toWalletName,
      catName,
      note,
    ].join(",");
  });

  const csvContent = "\uFEFF" + [headers.join(","), ...rows].join("\r\n"); // \uFEFF BOM for Excel compatibility

  const filename = month ? `transaksi-${month}.csv` : `semua-transaksi-${new Date().toISOString().split("T")[0]}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}


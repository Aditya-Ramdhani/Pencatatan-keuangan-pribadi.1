"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatRupiah } from "@/lib/currency";

interface CashFlowChartProps {
  data: {
    label: string;
    income: number;
    expense: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
        <p className="font-bold text-slate-700 mb-1.5">{label}</p>
        <p className="text-emerald-600 font-semibold">
          Pemasukan: {formatRupiah(payload[0]?.value || 0)}
        </p>
        <p className="text-red-500 font-semibold">
          Pengeluaran: {formatRupiah(payload[1]?.value || 0)}
        </p>
      </div>
    );
  }
  return null;
};

export function CashFlowChart({ data }: CashFlowChartProps) {
  const hasData = data.some((d) => d.income > 0 || d.expense > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
        <p>Belum ada data transaksi untuk 6 bulan terakhir.</p>
        <p className="text-xs text-slate-400 mt-1">Catat transaksi untuk melihat perbandingan arus kas.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
          barGap={6}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            stroke="#94a3b8"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) =>
              value >= 1000000
                ? `${(value / 1000000).toFixed(1)}jt`
                : value >= 1000
                ? `${(value / 1000).toFixed(0)}rb`
                : `${value}`
            }
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: "15px", fontSize: "12px" }}
          />
          <Bar
            dataKey="income"
            name="Pemasukan"
            fill="#10b981"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
          <Bar
            dataKey="expense"
            name="Pengeluaran"
            fill="#ef4444"
            radius={[6, 6, 0, 0]}
            maxBarSize={32}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}


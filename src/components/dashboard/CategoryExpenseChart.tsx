"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatRupiah } from "@/lib/currency";

interface CategoryExpenseItem {
  name: string;
  color: string;
  amount: number;
  percentage: number;
}

interface CategoryExpenseChartProps {
  data: CategoryExpenseItem[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload as CategoryExpenseItem;
    return (
      <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-100 text-xs">
        <p className="font-bold text-slate-800">{item.name}</p>
        <p className="text-red-500 font-semibold">{formatRupiah(item.amount)}</p>
        <p className="text-slate-400">{item.percentage.toFixed(1)}% dari total pengeluaran</p>
      </div>
    );
  }
  return null;
};

export function CategoryExpenseChart({ data }: CategoryExpenseChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
        <p>Belum ada pengeluaran di bulan ini.</p>
        <p className="text-xs text-slate-400 mt-1">Pengeluaran yang dicatat akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
      {/* Donut Chart */}
      <div className="w-48 h-48 sm:w-56 sm:h-56 relative flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="amount"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || "#6b7280"} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown List */}
      <div className="flex-1 w-full space-y-2.5 max-h-56 overflow-y-auto pr-1">
        {data.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="font-medium text-slate-700 truncate">{item.name}</span>
            </div>
            <div className="text-right flex-shrink-0 pl-2">
              <span className="font-bold text-slate-800 block">
                {formatRupiah(item.amount)}
              </span>
              <span className="text-[11px] text-slate-400">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


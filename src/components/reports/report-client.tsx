"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import {
  Calendar,
  Download,
  TrendingUp,
  Package,
  Receipt,
  DollarSign,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart,
} from "recharts";
import * as XLSX from "xlsx";

type ReportStats = {
  totalRevenue: number;
  totalTransactions: number;
  totalProducts: number;
  averageTransaction: number;
};

type DateRange = {
  start: string;
  end: string;
};

type ReportData = {
  stats: ReportStats;
  dailyRevenue: { date: string; revenue: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
  categoryRevenue: { category: string; revenue: number }[];
};

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
];

export default function ReportClient({ data }: { data: ReportData }) {
  const [dateRange, setDateRange] = useState<DateRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  const revenueChartData = data.dailyRevenue.map((d) => {
    const date = new Date(d.date);
    return {
      date: date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
      }),
      pendapatan: d.revenue,
    };
  });

  const categoryChartData = data.categoryRevenue.map((c) => ({
    name: c.category,
    value: c.revenue,
  }));

  const exportReport = () => {
    const wb = XLSX.utils.book_new();

    const sheetData = [
      ["LAPORAN PENJUALAN"],
      [`Periode: ${dateRange.start} s/d ${dateRange.end}`],
      [],
      ["RINGKASAN"],
      ["Total Pendapatan", data.stats.totalRevenue],
      ["Total Transaksi", data.stats.totalTransactions],
      ["Produk Terjual", data.stats.totalProducts],
      ["Rata-rata Transaksi", Math.round(data.stats.averageTransaction)],
      [],
      ["DETAIL PRODUK TERLARIS"],
      ["No", "Nama Produk", "Terjual", "Pendapatan"],
      ...data.topProducts.map((p, i) => [i + 1, p.name, p.sold, p.revenue]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(sheetData);

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
    ];

    ws["!cols"] = [{ wch: 6 }, { wch: 25 }, { wch: 15 }, { wch: 20 }];

    const range = XLSX.utils.decode_range(ws["!ref"]!);

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = ws[cellAddress];
        if (!cell) continue;

        cell.s = {
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" },
          },
          alignment: {
            vertical: "center",
            horizontal: C === 0 ? "left" : "right",
          },
        };

        if (R === 11) {
          cell.s.fill = {
            fgColor: { rgb: "E5E7EB" },
          };
          cell.s.font = { bold: true };
          cell.s.alignment = { horizontal: "center" };
        }

        if (R === 0) {
          cell.s.font = { bold: true, sz: 16 };
          cell.s.alignment = { horizontal: "center" };
        }
      }
    }

    XLSX.utils.book_append_sheet(wb, ws, "Laporan");
    XLSX.writeFile(wb, `laporan-penjualan-${dateRange.start}.xlsx`);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-green-600">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-green-600">
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Laporan Penjualan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Analisis performa bisnis Anda
          </p>
        </div>
        <Button onClick={exportReport}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
              />
              <span>-</span>
              <input
                type="date"
                className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Pendapatan</p>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(data.stats.totalRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total Transaksi</p>
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{data.stats.totalTransactions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                Rata-rata Transaksi
              </p>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(data.stats.averageTransaction)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Produk Terjual</p>
              <Package className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold">{data.stats.totalProducts}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grafik Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="pendapatan"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  strokeWidth={3}
                  name="Pendapatan"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pendapatan per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    percent !== undefined
                      ? `${name}: ${(percent * 100).toFixed(0)}%`
                      : name
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Produk Terlaris</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-bold text-lg">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.sold} unit terjual
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-lg text-green-600">
                  {formatCurrency(product.revenue)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

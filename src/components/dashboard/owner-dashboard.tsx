"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Users,
  Package,
  Receipt,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type DashboardStats = {
  totalProducts: number;
  totalTransactions: number;
  totalRevenue: number;
  activeUsers: number;
  lowStockProducts: number;
  todayTransactions: number;
  todayRevenue: number;
};

type ChartData = {
  dates: string[];
  revenues: number[];
  transactions: number[];
};

type TopProduct = {
  name: string;
  total_sold: number;
  revenue: number;
};

type OwnerDashboardProps = {
  name?: string;
  stats: DashboardStats;
  chartData: ChartData;
  topProducts: TopProduct[];
};

export default function OwnerDashboard({
  name,
  stats,
  chartData,
  topProducts,
}: OwnerDashboardProps) {
  // Transform data for recharts
  const revenueData = chartData.dates.map((date, index) => ({
    date,
    pendapatan: chartData.revenues[index],
  }));

  const transactionData = chartData.dates.map((date, index) => ({
    date,
    transaksi: chartData.transactions[index],
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome, {name} 👋</h1>
        <p className="text-muted-foreground">Overview of your business today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Produk"
          icon={Package}
          value={stats.totalProducts.toString()}
          subtitle={`${stats.lowStockProducts} stok rendah`}
          trend={null}
        />
        <StatCard
          title="Transaksi Hari Ini"
          icon={Receipt}
          value={stats.todayTransactions.toString()}
          subtitle={`Total: ${stats.totalTransactions}`}
          trend={null}
        />
        <StatCard
          title="Pendapatan Hari Ini"
          icon={DollarSign}
          value={formatCurrency(stats.todayRevenue)}
          subtitle={`Total: ${formatCurrency(stats.totalRevenue)}`}
          trend={null}
        />
        <StatCard
          title="User Aktif"
          icon={Users}
          value={stats.activeUsers.toString()}
          subtitle="Pengguna sistem"
          trend={null}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Pendapatan 7 Hari Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number | undefined) =>
                    typeof value === "number" ? formatCurrency(value) : "-"
                  }
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="pendapatan"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: "#3b82f6", r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Pendapatan"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Transaksi 7 Hari Terakhir
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={transactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="transaksi"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  name="Transaksi"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Produk Terlaris</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-3 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {product.total_sold} terjual
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-green-600">
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

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: any;
  trend: number | null;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
        <p className="text-2xl font-bold mb-1">{value}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

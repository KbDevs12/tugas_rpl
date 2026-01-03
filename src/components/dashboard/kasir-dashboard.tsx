import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Receipt,
  Package,
  Clock,
  DollarSign,
} from "lucide-react";
import Link from "next/link";

type KasirStats = {
  todayTransactions: number;
  todayRevenue: number;
  lowStockCount: number;
};

type RecentTransaction = {
  id: string;
  created_at: string;
  total_price: number;
  items_count: number;
};

type KasirDashboardProps = {
  name?: string;
  stats: KasirStats;
  recentTransactions: RecentTransaction[];
};

export default function KasirDashboard({
  name,
  stats,
  recentTransactions,
}: KasirDashboardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Hai, {name} 👋</h1>
        <p className="text-muted-foreground">
          Siap untuk melayani pelanggan hari ini?
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickCard
          title="Buat Transaksi"
          description="Mulai transaksi baru"
          icon={ShoppingCart}
          href="/dashboard/transactions/create"
          variant="primary"
        />
        <QuickCard
          title="Riwayat Transaksi"
          description="Lihat transaksi hari ini"
          icon={Receipt}
          href="/dashboard/transactions"
          variant="default"
        />
        <QuickCard
          title="Cek Produk"
          description="Lihat stok produk"
          icon={Package}
          href="/dashboard/products"
          variant="default"
        />
      </div>

      {/* Stats Today */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                Transaksi Hari Ini
              </p>
              <Receipt className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{stats.todayTransactions}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                Pendapatan Hari Ini
              </p>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">
              {formatCurrency(stats.todayRevenue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">
                Produk Stok Rendah
              </p>
              <Package className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-500">
              {stats.lowStockCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Transaksi Terakhir
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Belum ada transaksi hari ini
            </p>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between border-b pb-3 last:border-0"
                >
                  <div>
                    <p className="font-medium">#{transaction.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.created_at).toLocaleTimeString(
                        "id-ID",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}{" "}
                      • {transaction.items_count} item
                    </p>
                  </div>
                  <p className="font-semibold text-green-600">
                    {formatCurrency(transaction.total_price)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Catatan</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2">
          <p>• Pastikan stok produk selalu dicek sebelum transaksi</p>
          <p>• Konfirmasi total pembayaran dengan pelanggan</p>
          <p>• Jangan lupa memberikan struk kepada pelanggan</p>
        </CardContent>
      </Card>
    </div>
  );
}

function QuickCard({
  title,
  description,
  icon: Icon,
  href,
  variant = "default",
}: {
  title: string;
  description: string;
  icon: any;
  href: string;
  variant?: "default" | "primary";
}) {
  return (
    <Card className={variant === "primary" ? "border-primary" : ""}>
      <CardContent className="p-6">
        <Icon
          className={`h-10 w-10 mb-4 ${
            variant === "primary" ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <p className="font-semibold text-lg mb-1">{title}</p>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        <Button
          asChild
          className="w-full"
          variant={variant === "primary" ? "default" : "outline"}
        >
          <Link href={href}>Buka</Link>
        </Button>
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

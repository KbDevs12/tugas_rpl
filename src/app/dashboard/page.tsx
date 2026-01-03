import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/get-session";
import OwnerDashboard from "@/components/dashboard/owner-dashboard";
import KasirDashboard from "@/components/dashboard/kasir-dashboard";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const supabase = createClient(cookies());

  if (session.role === "owner") {
    // Get stats for owner
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      productsRes,
      transactionsRes,
      todayTransactionsRes,
      usersRes,
      lowStockRes,
      last7DaysRes,
      topProductsRes,
    ] = await Promise.all([
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("transactions").select("total_price"),
      supabase
        .from("transactions")
        .select("id, total_price")
        .gte("created_at", today.toISOString()),
      supabase
        .from("users")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .lte("stock", 10),
      supabase
        .from("transactions")
        .select("created_at, total_price")
        .gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        ),
      supabase.rpc("get_top_products", { limit_count: 5 }),
    ]);

    const stats = {
      totalProducts: productsRes.count || 0,
      totalTransactions: transactionsRes.data?.length || 0,
      totalRevenue:
        transactionsRes.data?.reduce((sum, t) => sum + t.total_price, 0) || 0,
      activeUsers: usersRes.count || 0,
      lowStockProducts: lowStockRes.count || 0,
      todayTransactions: todayTransactionsRes.data?.length || 0,
      todayRevenue:
        todayTransactionsRes.data?.reduce((sum, t) => sum + t.total_price, 0) ||
        0,
    };

    // Process chart data
    const chartData = processChartData(last7DaysRes.data || []);

    // Process top products (you'll need to create this RPC function)
    const topProducts = topProductsRes.data || [];

    return (
      <OwnerDashboard
        name={session.name}
        stats={stats}
        chartData={chartData}
        topProducts={topProducts}
      />
    );
  }

  // Kasir dashboard
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayTransactionsRes, lowStockRes, recentTransactionsRes] =
    await Promise.all([
      supabase
        .from("transactions")
        .select("id, total_price")
        .gte("created_at", today.toISOString()),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .lte("stock", 10),
      supabase
        .from("transactions")
        .select(
          `
        id,
        created_at,
        total_price,
        transaction_items(id)
      `
        )
        .gte("created_at", today.toISOString())
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const kasirStats = {
    todayTransactions: todayTransactionsRes.data?.length || 0,
    todayRevenue:
      todayTransactionsRes.data?.reduce((sum, t) => sum + t.total_price, 0) ||
      0,
    lowStockCount: lowStockRes.count || 0,
  };

  const recentTransactions = (recentTransactionsRes.data || []).map((t) => ({
    id: t.id,
    created_at: t.created_at,
    total_price: t.total_price,
    items_count: t.transaction_items?.length || 0,
  }));

  return (
    <KasirDashboard
      name={session.name}
      stats={kasirStats}
      recentTransactions={recentTransactions}
    />
  );
}

function processChartData(transactions: any[]) {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });

  const dataMap = new Map<string, { revenue: number; count: number }>();

  last7Days.forEach((date) => {
    dataMap.set(date, { revenue: 0, count: 0 });
  });

  transactions.forEach((t) => {
    const date = t.created_at.split("T")[0];
    if (dataMap.has(date)) {
      const current = dataMap.get(date)!;
      dataMap.set(date, {
        revenue: current.revenue + t.total_price,
        count: current.count + 1,
      });
    }
  });

  return {
    dates: last7Days.map((date) => {
      const d = new Date(date);
      return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    }),
    revenues: last7Days.map((date) => dataMap.get(date)!.revenue),
    transactions: last7Days.map((date) => dataMap.get(date)!.count),
  };
}

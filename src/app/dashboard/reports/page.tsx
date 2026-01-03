import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/get-session";
import ReportClient from "@/components/reports/report-client";

export default async function ReportsPage() {
  const session = await getSession();

  if (!session || session.role !== "owner") {
    redirect("/dashboard");
  }

  const supabase = createClient(cookies());

  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();

  const [
    transactionsRes,
    topProductsRes,
    categoryRevenueRes,
    totalProductsRes,
  ] = await Promise.all([
    supabase
      .from("transactions")
      .select("created_at, total_price")
      .gte("created_at", thirtyDaysAgo),

    supabase.rpc("get_top_products", { limit_count: 10 }),

    supabase.rpc("get_category_revenue"),

    supabase.rpc("get_total_products_sold", {
      start_date: thirtyDaysAgo,
      end_date: new Date().toISOString(),
    }),
  ]);

  const transactions = transactionsRes.data || [];

  const dailyRevenueMap = new Map<string, number>();
  transactions.forEach((t) => {
    const date = t.created_at.split("T")[0];
    dailyRevenueMap.set(date, (dailyRevenueMap.get(date) || 0) + t.total_price);
  });

  const dailyRevenue = Array.from(dailyRevenueMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const stats = {
    totalRevenue: transactions.reduce((sum, t) => sum + t.total_price, 0),
    totalTransactions: transactions.length,
    totalProducts: totalProductsRes.data?.[0]?.total ?? 0,
    averageTransaction:
      transactions.length > 0
        ? transactions.reduce((sum, t) => sum + t.total_price, 0) /
          transactions.length
        : 0,
  };

  const reportData = {
    stats,
    dailyRevenue,
    topProducts: topProductsRes.data || [],
    categoryRevenue: categoryRevenueRes.data || [],
  };

  return <ReportClient data={reportData} />;
}

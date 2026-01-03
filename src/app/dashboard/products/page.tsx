import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/get-session";
import ProductClient from "@/components/products/product-client";

export default async function ProductsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const supabase = createClient(cookies());

  const [productsRes, categoriesRes, discountsRes] = await Promise.all([
    supabase
      .from("products")
      .select(
        `
        *,
        categories (name),
        discounts (name, type, value)
      `
      )
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
    supabase.from("discounts").select("*").order("name"),
  ]);

  return (
    <ProductClient
      data={productsRes.data || []}
      categories={categoriesRes.data || []}
      discounts={discountsRes.data || []}
    />
  );
}

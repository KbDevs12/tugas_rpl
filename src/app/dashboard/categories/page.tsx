import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/get-session";
import CategoryClient from "@/components/categories/category-client";

export default async function CategoryPage() {
  const session = await getSession();

  if (!session || session.role !== "owner") {
    redirect("/dashboard");
  }

  const supabase = createClient(cookies());
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("created_at", { ascending: false });

  return <CategoryClient data={data || []} />;
}

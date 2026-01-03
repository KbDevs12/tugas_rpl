import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/get-session";
import DiscountClient from "@/components/discounts/discount-client";

export default async function DiscountsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const supabase = createClient(cookies());
  const { data } = await supabase
    .from("discounts")
    .select("*")
    .order("created_at", { ascending: false });

  return <DiscountClient data={data || []} />;
}

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/get-session";
import CreateTransaction from "@/components/transactions/create-transaction";

export default async function CreateTransactionPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const supabase = createClient(cookies());

  const { data: products } = await supabase
    .from("products")
    .select(
      `
      *,
      discounts (type, value)
    `
    )
    .eq("is_active", true)
    .order("name");

  return (
    <CreateTransaction products={products || []} userId={session.user.id} />
  );
}

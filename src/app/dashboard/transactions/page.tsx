import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/get-session";
import TransactionClient from "@/components/transactions/transaction-client";

export default async function TransactionsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  const supabase = createClient(cookies());

  const { data } = await supabase
    .from("transactions")
    .select(
      `
      *,
      users (name),
      transaction_items (
        quantity,
        price,
        subtotal,
        products (name)
      )
    `
    )
    .order("created_at", { ascending: false });

  return <TransactionClient data={data || []} />;
}

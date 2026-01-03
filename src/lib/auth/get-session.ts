import { createClient } from "../supabase/server";
import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("role, name")
    .eq("id", user.id)
    .single();

  return {
    user,
    role: profile?.role as "owner" | "kasir",
    name: profile?.name,
  };
}

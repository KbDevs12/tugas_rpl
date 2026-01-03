import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSession } from "@/lib/auth/get-session";
import UserClient from "@/components/users/user-client";

export default async function UsersPage() {
  const session = await getSession();

  if (!session || session.role !== "owner") {
    redirect("/dashboard");
  }

  const supabase = createClient(cookies());

  // ✅ Ambil users dari public.users
  const { data: users } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: authUsers } = await supabase.auth.admin.listUsers();

  const usersWithEmail = users?.map((user) => {
    const authUser = authUsers?.users.find((au) => au.id === user.id);
    return {
      ...user,
      auth_users: {
        email: authUser?.email || "",
      },
    };
  });

  return <UserClient data={usersWithEmail || []} />;
}

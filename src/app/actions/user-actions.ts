"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";
import { userFormSchema, UserFormSchema } from "@/lib/validation/user";

export async function createUserAction(values: UserFormSchema) {
  // 1. Validasi
  const parsed = userFormSchema.safeParse(values);
  if (!parsed.success) {
    throw new Error("Invalid payload");
  }

  if (parsed.data.mode !== "create") {
    throw new Error("Invalid mode");
  }

  const { email, password, name, role, is_active } = parsed.data;

  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    throw authError ?? new Error("Failed to create auth user");
  }

  const { error: userError } = await supabaseAdmin
    .from("users")
    .update({
      name,
      role,
      is_active,
    })
    .eq("id", authData.user.id);

  if (userError) {
    throw userError;
  }

  return { success: true };
}

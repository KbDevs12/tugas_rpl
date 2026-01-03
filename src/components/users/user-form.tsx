"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { userFormSchema, type UserFormSchema } from "@/lib/validation/user";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createUserAction } from "@/app/actions/user-actions";

type User = {
  id: string;
  name: string;
  role: "owner" | "kasir";
  is_active: boolean;
};

type UserFormProps = {
  mode: "create" | "update";
  user?: User | null;
  onClose: () => void;
  open: boolean;
};
export default function UserForm({ mode, user, open, onClose }: UserFormProps) {
  const supabase = createClient();
  const router = useRouter();
  const form = useForm<UserFormSchema>({
    resolver: zodResolver(userFormSchema),
    shouldUnregister: true,
    defaultValues:
      mode === "create"
        ? {
            mode: "create" as const,
            email: "",
            password: "",
            name: "",
            role: "kasir" as const,
            is_active: true,
          }
        : {
            mode: "update" as const,
            name: user?.name ?? "",
            role: user?.role ?? ("kasir" as const),
            is_active: user?.is_active ?? true,
          },
  });

  useEffect(() => {
    if (mode === "update" && user) {
      form.reset({
        mode: "update" as const,
        name: user.name,
        role: user.role,
        is_active: user.is_active,
      });
    } else if (mode === "create") {
      form.reset({
        mode: "create" as const,
        email: "",
        password: "",
        name: "",
        role: "kasir" as const,
        is_active: true,
      });
    }
  }, [mode, user, form]);

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const onSubmit = async (values: UserFormSchema) => {
    try {
      if (values.mode === "create") {
        await createUserAction(values);
        toast.success("User berhasil ditambahkan");
      } else {
        const { error } = await supabase
          .from("users")
          .update({
            name: values.name,
            role: values.role,
            is_active: values.is_active,
          })
          .eq("id", user?.id);
        if (error) throw error;

        toast.success("User berhasil diupdate");
      }
      handleClose();
      router.refresh();
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error("Gagal menyimpan user");
    }
  };

  const errors = form.formState.errors as any;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Tambah User" : "Edit User"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create" ? "Tambahkan user baru" : "Perbarui data user"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <input type="hidden" value={mode} {...form.register("mode")} />
            {mode === "create" && (
              <>
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="email@example.com"
                    {...form.register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    placeholder="Minimal 6 karakter"
                    {...form.register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label>Nama</Label>
              <Input placeholder="Nama lengkap" {...form.register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Role</Label>
              <select
                className="h-10 rounded-md border px-3"
                {...form.register("role")}
              >
                <option value="kasir">Kasir</option>
                <option value="owner">Owner</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Status Aktif</Label>
              <Switch
                checked={form.watch("is_active")}
                onCheckedChange={(v) => form.setValue("is_active", v)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Batal
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {mode === "create" ? "Simpan" : "Update"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

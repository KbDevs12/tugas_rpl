"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { categorySchema, type CategorySchema } from "@/lib/validation/category";
import { createClient } from "@/lib/supabase/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type Category = {
  id: string;
  name: string;
  created_at: string;
};

type CategoryFormProps = {
  category?: Category | null;
  onClose?: () => void;
};

export default function CategoryForm({ category, onClose }: CategoryFormProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<CategorySchema>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
    },
  });

  useEffect(() => {
    if (category) {
      form.reset({ name: category.name });
      setOpen(true);
    }
  }, [category, form]);

  const handleClose = () => {
    setOpen(false);
    form.reset();
    onClose?.();
  };

  const onSubmit = async (values: CategorySchema) => {
    try {
      if (category) {
        const { error } = await supabase
          .from("categories")
          .update(values)
          .eq("id", category.id);

        if (error) throw error;

        toast.success("Kategori berhasil diperbarui");
      } else {
        const { error } = await supabase.from("categories").insert([values]);

        if (error) throw error;

        toast.success("Kategori berhasil ditambahkan");
      }

      handleClose();
      router.refresh();
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(
        category ? "Gagal memperbarui kategori" : "Gagal menambahkan kategori"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Kategori
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {category ? "Edit Kategori" : "Tambah Kategori Baru"}
            </DialogTitle>
            <DialogDescription>
              {category
                ? "Ubah nama kategori yang sudah ada"
                : "Buat kategori baru untuk mengorganisir produk Anda"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nama Kategori
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Contoh: Sweaters, Jacket, dlln"
                {...form.register("name")}
                autoFocus
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={form.formState.isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : category ? (
                "Update"
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

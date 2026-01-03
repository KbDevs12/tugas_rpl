"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductSchema } from "@/lib/validation/product";
import { createClient } from "@/lib/supabase/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
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
import { z } from "zod";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category_id: string;
  discount_id: string | null;
  is_active: boolean;
  created_at: string;
};

type Category = {
  id: string;
  name: string;
};

type Discount = {
  id: string;
  name: string;
  type: string;
  value: number;
  is_active: boolean;
};

type ProductFormProps = {
  product?: Product | null;
  categories: Category[];
  discounts: Discount[];
  onClose?: () => void;
};

export default function ProductForm({
  product,
  categories,
  discounts,
  onClose,
}: ProductFormProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<z.input<typeof productSchema>>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      stock: 0,
      category_id: "",
      discount_id: null,
      is_active: true,
    },
  });

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        price: product.price,
        stock: product.stock,
        category_id: product.category_id,
        discount_id: product.discount_id,
        is_active: product.is_active,
      });
      setOpen(true);
    }
  }, [product, form]);

  const handleClose = () => {
    setOpen(false);
    form.reset();
    onClose?.();
  };

  const onSubmit = async (values: z.input<typeof productSchema>) => {
    try {
      const submitData = {
        ...values,
        discount_id: values.discount_id || null,
      };

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(submitData)
          .eq("id", product.id);

        if (error) throw error;
        toast.success("Produk berhasil diperbarui");
      } else {
        const { error } = await supabase.from("products").insert([submitData]);

        if (error) throw error;
        toast.success("Produk berhasil ditambahkan");
      }

      handleClose();
      router.refresh();
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(
        product ? "Gagal memperbarui produk" : "Gagal menambahkan produk"
      );
    }
  };

  const activeDiscounts = discounts.filter((d) => d.is_active);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Produk
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {product ? "Edit Produk" : "Tambah Produk Baru"}
            </DialogTitle>
            <DialogDescription>
              {product
                ? "Ubah informasi produk yang sudah ada"
                : "Tambahkan produk baru ke inventori Anda"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nama Produk
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Contoh: Baju Kaos Polos, Celana Jeans"
                {...form.register("name")}
                autoFocus
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="price">
                  Harga
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="25000"
                  {...form.register("price", { valueAsNumber: true })}
                />
                {form.formState.errors.price && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.price.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="stock">
                  Stok
                  <span className="text-destructive ml-1">*</span>
                </Label>
                <Input
                  id="stock"
                  type="number"
                  placeholder="100"
                  {...form.register("stock", { valueAsNumber: true })}
                />
                {form.formState.errors.stock && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.stock.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="category_id">
                Kategori
                <span className="text-destructive ml-1">*</span>
              </Label>
              <select
                id="category_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                {...form.register("category_id")}
              >
                <option value="">Pilih Kategori</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {form.formState.errors.category_id && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.category_id.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="discount_id">Diskon (Opsional)</Label>
              <select
                id="discount_id"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                {...form.register("discount_id")}
              >
                <option value="">Tanpa Diskon</option>
                {activeDiscounts.map((discount) => (
                  <option key={discount.id} value={discount.id}>
                    {discount.name} (
                    {discount.type === "percent"
                      ? `${discount.value}%`
                      : `Rp ${discount.value.toLocaleString()}`}
                    )
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Pilih diskon jika ingin memberikan potongan harga
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Status Aktif</Label>
              <Switch
                id="is_active"
                checked={form.watch("is_active")}
                onCheckedChange={(checked) =>
                  form.setValue("is_active", checked)
                }
              />
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
              ) : product ? (
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

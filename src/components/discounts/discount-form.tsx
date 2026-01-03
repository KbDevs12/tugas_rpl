"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { discountSchema, type DiscountSchema } from "@/lib/validation/discount";
import { createClient } from "@/lib/supabase/client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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

type Discount = {
  id: string;
  name: string;
  type: "percent" | "fixed";
  value: number;
  is_active: boolean;
  created_at: string;
};

type DiscountFormProps = {
  discount?: Discount | null;
  onClose?: () => void;
};

export default function DiscountForm({ discount, onClose }: DiscountFormProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const form = useForm<z.input<typeof discountSchema>>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      name: "",
      type: "percent",
      value: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (discount) {
      form.reset({
        name: discount.name,
        type: discount.type,
        value: discount.value,
        is_active: discount.is_active,
      });
      setOpen(true);
    }
  }, [discount, form]);

  const handleClose = () => {
    setOpen(false);
    form.reset();
    onClose?.();
  };

  const onSubmit = async (data: z.input<typeof discountSchema>) => {
    try {
      const values = {
        ...data,
        value: Number(data.value),
      };

      if (discount) {
        const { error } = await supabase
          .from("discounts")
          .update(values)
          .eq("id", discount.id);

        if (error) throw error;
        toast.success("Diskon berhasil diperbarui");
      } else {
        const { error } = await supabase.from("discounts").insert([values]);

        if (error) throw error;
        toast.success("Diskon berhasil ditambahkan");
      }

      handleClose();
      router.refresh();
    } catch (error) {
      console.error("Error saving discount:", error);
      toast.error(
        discount ? "Gagal memperbarui diskon" : "Gagal menambahkan diskon"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Tambah Diskon
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {discount ? "Edit Diskon" : "Tambah Diskon Baru"}
            </DialogTitle>
            <DialogDescription>
              {discount
                ? "Ubah informasi diskon yang sudah ada"
                : "Buat diskon baru untuk produk Anda"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Nama Diskon
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="name"
                placeholder="Contoh: Diskon Lebaran, Flash Sale"
                {...form.register("name")}
                autoFocus
              />
              {form.formState.errors.name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="type">
                Tipe Diskon
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Select>
                <SelectTrigger id="type" className="w-full">
                  <SelectValue
                    placeholder="Pilih tipe diskon"
                    {...form.register("type")}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Persentase (%)</SelectItem>
                  <SelectItem value="fixed">Nominal Tetap (Rp)</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.type && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.type.message}
                </p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="value">
                Nilai Diskon
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="value"
                type="number"
                placeholder="Contoh: 10 atau 5000"
                {...form.register("value", { valueAsNumber: true })}
              />
              {form.formState.errors.value && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.value.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {form.watch("type") === "percent"
                  ? "Masukkan angka 1-100 untuk persentase"
                  : "Masukkan nominal dalam Rupiah"}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Status Aktif</Label>
              <input type="hidden" {...form.register("is_active")} />
              <Switch
                id="is_active"
                checked={form.watch("is_active")}
                onCheckedChange={(checked) =>
                  form.setValue("is_active", checked, { shouldDirty: true })
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
              ) : discount ? (
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

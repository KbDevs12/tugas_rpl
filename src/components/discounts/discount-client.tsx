"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "../ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Badge } from "../ui/badge";
import { Pencil, Trash2, Percent } from "lucide-react";
import DiscountForm from "./discount-form";
import { createClient } from "@/lib/supabase/client";
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

export default function DiscountClient({ data }: { data: Discount[] }) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editDiscount, setEditDiscount] = useState<Discount | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("discounts").delete().eq("id", id);

      if (error) throw error;

      toast.success("Diskon berhasil dihapus");
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting discount:", error);
      toast.error("Gagal menghapus diskon");
    }
  };

  const formatDiscount = (type: string, value: number) => {
    if (type === "percent") {
      return `${value}%`;
    }
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Diskon</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola diskon untuk produk Anda
          </p>
        </div>
        <DiscountForm
          discount={editDiscount}
          onClose={() => setEditDiscount(null)}
        />
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
          <Percent className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Belum ada diskon</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Mulai dengan menambahkan diskon pertama Anda
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Diskon</TableHead>
                <TableHead>Tipe</TableHead>
                <TableHead>Nilai</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal Dibuat</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((discount) => (
                <TableRow key={discount.id}>
                  <TableCell className="font-medium">{discount.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {discount.type === "percent" ? "Persentase" : "Nominal"}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatDiscount(discount.type, discount.value)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={discount.is_active ? "default" : "secondary"}
                    >
                      {discount.is_active ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(discount.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditDiscount(discount)}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(discount.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Hapus
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Diskon akan dihapus secara
              permanen dan produk yang menggunakan diskon ini akan kehilangan
              diskonnya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

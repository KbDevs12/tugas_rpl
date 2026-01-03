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
import { Pencil, Trash2, Package } from "lucide-react";
import ProductForm from "./product-form";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  category_id: string;
  discount_id: string | null;
  is_active: boolean;
  created_at: string;
  categories: { name: string } | null;
  discounts: { name: string; type: string; value: number } | null;
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

type ProductClientProps = {
  data: Product[];
  categories: Category[];
  discounts: Discount[];
};

export default function ProductClient({
  data,
  categories,
  discounts,
}: ProductClientProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editProduct, setEditProduct] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);

      if (error) throw error;

      toast.success("Produk berhasil dihapus");
      setDeleteId(null);
      router.refresh();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Gagal menghapus produk");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const calculateDiscountedPrice = (price: number, discount: any) => {
    if (!discount) return price;

    if (discount.type === "percent") {
      return price - (price * discount.value) / 100;
    }
    return price - discount.value;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Produk</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola produk dan inventori Anda
          </p>
        </div>
        <ProductForm
          product={editProduct}
          categories={categories}
          discounts={discounts}
          onClose={() => setEditProduct(null)}
        />
      </div>

      {data.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg bg-muted/20">
          <Package className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Belum ada produk</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Mulai dengan menambahkan produk pertama Anda
          </p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Produk</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Harga</TableHead>
                <TableHead>Diskon</TableHead>
                <TableHead>Harga Akhir</TableHead>
                <TableHead>Stok</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((product) => {
                const finalPrice = calculateDiscountedPrice(
                  product.price,
                  product.discounts
                );
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      {product.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {product.categories?.name || "-"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      {product.discounts ? (
                        <Badge variant="secondary">
                          {product.discounts.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {product.discounts && finalPrice !== product.price ? (
                        <div className="flex flex-col">
                          <span className="text-destructive line-through text-sm">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-green-600">
                            {formatPrice(finalPrice)}
                          </span>
                        </div>
                      ) : (
                        formatPrice(product.price)
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.stock > 10
                            ? "default"
                            : product.stock > 0
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {product.stock} unit
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={product.is_active ? "default" : "secondary"}
                      >
                        {product.is_active ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditProduct(product)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteId(product.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Hapus
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Produk akan dihapus secara
              permanen dari database.
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

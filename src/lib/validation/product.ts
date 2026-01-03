import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Nama produk harus diisi"),
  price: z.number().min(1, "Harga harus lebih dari 0"),
  stock: z.number().min(0, "Stok tidak boleh negatif"),
  category_id: z.string().uuid("Kategori harus dipilih"),
  discount_id: z.string().uuid().nullable().optional(),
  is_active: z.boolean().default(true),
});

export type ProductSchema = z.infer<typeof productSchema>;

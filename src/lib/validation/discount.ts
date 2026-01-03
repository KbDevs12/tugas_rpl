import { z } from "zod";

export const discountSchema = z.object({
  name: z.string().min(1, "Nama diskon harus diisi"),
  type: z.enum(["percent", "fixed"], "Tipe diskon tidak valid"),
  value: z.number().min(1, "Nilai diskon harus lebih dari 0"),
  is_active: z.boolean().default(true),
});

export type DiscountSchema = z.infer<typeof discountSchema>;

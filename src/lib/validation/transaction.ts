import { z } from "zod";

export const transactionItemSchema = z.object({
  product_id: z.string().uuid(),
  product_name: z.string(),
  quantity: z.number().min(1),
  price: z.number().min(0),
  subtotal: z.number().min(0),
  stock: z.number(),
});

export const transactionSchema = z.object({
  items: z
    .array(transactionItemSchema)
    .min(1, "Minimal 1 produk harus ditambahkan"),
  total_price: z.number().min(0),
  payment: z.number().min(0),
  change_amount: z.number().min(0),
});

export type TransactionItemSchema = z.infer<typeof transactionItemSchema>;
export type TransactionSchema = z.infer<typeof transactionSchema>;

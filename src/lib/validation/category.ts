import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(3, "Category name cannot be empty"),
});

export type CategorySchema = z.infer<typeof categorySchema>;

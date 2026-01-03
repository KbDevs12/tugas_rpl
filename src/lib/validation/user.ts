import { z } from "zod";

export const createUserSchema = z.object({
  mode: z.literal("create"),
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["owner", "kasir"]),
  is_active: z.boolean(),
});

export const updateUserSchema = z.object({
  mode: z.literal("update"),
  name: z.string().min(1),
  role: z.enum(["owner", "kasir"]),
  is_active: z.boolean(),
});

export const userFormSchema = z.discriminatedUnion("mode", [
  createUserSchema,
  updateUserSchema,
]);

export type UserFormSchema = z.infer<typeof userFormSchema>;

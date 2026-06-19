import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Введите корректный email"),
  password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
});

export const memorialSchema = z.object({
  fullName: z.string().min(2, "Укажите ФИО"),
  slug: z
    .string()
    .min(2, "Slug слишком короткий")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "Slug: только латиница, цифры и дефис"),
  birthDate: z.string().min(1, "Укажите дату рождения"),
  deathDate: z.string().min(1, "Укажите дату смерти"),
  epitaph: z.string().max(500).optional(),
  biography: z.string().max(20000).optional(),
  cemeteryLocation: z.string().max(500).optional(),
  videoUrls: z.array(z.string().url()).max(10).optional(),
});

export type MemorialInput = z.infer<typeof memorialSchema>;

import { z } from "zod";
import { stripControlChars } from "@/lib/text";

export const profileSchema = z.object({
  displayName: z
    .string()
    .transform((s) => stripControlChars(s).trim())
    .pipe(z.string().min(2, "Escribe tu nombre (mínimo 2 caracteres)").max(60, "Máximo 60 caracteres")),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_.]{3,30}$/, "3–30 caracteres: letras minúsculas, números, punto o guion bajo"),
  bio: z
    .string()
    .transform((s) => stripControlChars(s).trim())
    .pipe(z.string().max(280, "Máximo 280 caracteres")),
  avatarUrl: z.string().trim().max(500).default(""),
});

export type ProfileFormState = {
  ok?: boolean;
  username?: string;
  errors?: Record<string, string[] | undefined>;
  message?: string;
};

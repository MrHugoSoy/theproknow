import { z } from "zod";
import { stripControlChars } from "@/lib/text";

export const commentSchema = z.object({
  postId: z.string().uuid(),
  parentId: z
    .string()
    .optional()
    .transform((v) => (v ? v : null))
    .pipe(z.string().uuid().nullable()),
  body: z
    .string()
    .transform((s) => stripControlChars(s).trim())
    .pipe(z.string().min(1, "Escribe tu comentario").max(5000, "Máximo 5,000 caracteres")),
});

export type CommentFormState = {
  ok?: boolean;
  /** cambia en cada envío correcto para que el formulario sepa que debe limpiarse */
  nonce?: number;
  errors?: Record<string, string[] | undefined>;
  message?: string;
};

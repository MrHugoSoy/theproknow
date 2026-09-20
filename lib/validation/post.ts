import { z } from "zod";
import { parseYouTubeId, stripControlChars } from "@/lib/text";

export const POST_TYPES = ["consejo", "pregunta", "tutorial", "articulo"] as const;

export const COVER_MAX_BYTES = 5 * 1024 * 1024;
export const COVER_MIME = ["image/jpeg", "image/png", "image/webp"] as const;

export const postSchema = z
  .object({
    type: z.enum(POST_TYPES, { message: "Elige el tipo de publicación" }),
    communityId: z.string().uuid("Elige una comunidad"),
    title: z
      .string()
      .transform((s) => stripControlChars(s).trim())
      .pipe(z.string().min(5, "El título debe tener al menos 5 caracteres").max(140, "Máximo 140 caracteres")),
    body: z
      .string()
      .transform((s) => stripControlChars(s).trim())
      .pipe(z.string().min(10, "Escribe al menos 10 caracteres").max(20000, "Máximo 20,000 caracteres")),
    coverUrl: z.string().trim().max(500).optional().default(""),
    videoUrl: z.string().trim().max(300).optional().default(""),
  })
  .superRefine((v, ctx) => {
    if (v.videoUrl && !parseYouTubeId(v.videoUrl)) {
      ctx.addIssue({ code: "custom", path: ["videoUrl"], message: "Solo se permiten enlaces de YouTube" });
    }
    if (v.videoUrl && v.type !== "tutorial") {
      ctx.addIssue({ code: "custom", path: ["videoUrl"], message: "El video solo aplica a tutoriales" });
    }
  });

export type PostInput = z.infer<typeof postSchema>;

export type PostFormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
};

/** URL canónica para guardar en la base (nunca se guarda HTML de embed). */
export function canonicalYouTubeUrl(input: string): string | null {
  const id = parseYouTubeId(input);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Ingresa un correo válido"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

export const registerSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Escribe tu nombre (mínimo 2 caracteres)")
    .max(60, "Máximo 60 caracteres"),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_.]{3,30}$/, "3–30 caracteres: letras minúsculas, números, punto o guion bajo"),
  email: z.string().trim().email("Ingresa un correo válido"),
  password: z
    .string()
    .min(8, "Mínimo 8 caracteres")
    .max(72, "Máximo 72 caracteres")
    .regex(/[A-Za-z]/, "Incluye al menos una letra")
    .regex(/[0-9]/, "Incluye al menos un número"),
});

export type FieldErrors = Record<string, string[] | undefined>;

export type AuthState = {
  errors?: FieldErrors;
  message?: string;
  /** true cuando el registro requiere confirmar el correo */
  needsConfirmation?: boolean;
};

/** Solo rutas internas: evita open-redirect vía ?next= */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

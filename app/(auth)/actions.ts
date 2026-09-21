"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSiteUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  recoverSchema,
  registerSchema,
  resetSchema,
  safeNext,
  type AuthState,
} from "@/lib/validation/auth";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({ email: str(formData, "email"), password: str(formData, "password") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") {
      return {
        message: "Confirma tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.",
        unconfirmedEmail: parsed.data.email,
      };
    }
    return { message: "Correo o contraseña incorrectos." };
  }
  redirect(safeNext(str(formData, "next")));
}

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = registerSchema.safeParse({
    displayName: str(formData, "displayName"),
    username: str(formData, "username"),
    email: str(formData, "email"),
    password: str(formData, "password"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const { displayName, username, email, password } = parsed.data;

  const supabase = await createClient();

  const { data: taken, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
  if (lookupError) {
    console.error("signUp: no se pudo comprobar el nombre de usuario", lookupError);
    return { message: "No pudimos crear tu cuenta en este momento. Inténtalo de nuevo." };
  }
  if (taken) return { errors: { username: ["Ese nombre de usuario ya está en uso"] } };

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { display_name: displayName, username },
      emailRedirectTo: `${getSiteUrl()}/auth/callback`,
    },
  });
  if (error) {
    return {
      message:
        error.code === "user_already_exists"
          ? "Ya existe una cuenta con ese correo."
          : "No pudimos crear tu cuenta. Inténtalo de nuevo.",
    };
  }
  // Con confirmación de correo activa no hay sesión todavía.
  if (!data.session) return { needsConfirmation: true, message: email };
  redirect("/");
}

/** Reenvía el correo de confirmación de registro. */
export async function resendConfirmation(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = recoverSchema.safeParse({ email: str(formData, "email") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${getSiteUrl()}/auth/callback` },
  });
  if (error?.status === 429 || error?.code === "over_email_send_rate_limit") {
    return { message: "Ya enviamos un correo hace poco. Espera un minuto e inténtalo de nuevo." };
  }
  if (error) console.error("resendConfirmation:", error);
  return { ok: true, message: `Si ${parsed.data.email} tiene una cuenta pendiente, te enviamos un nuevo enlace.` };
}

/**
 * Envía el enlace para restablecer la contraseña. La respuesta es la misma exista o no la cuenta,
 * para no revelar qué correos están registrados.
 */
export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = recoverSchema.safeParse({ email: str(formData, "email") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${getSiteUrl()}/auth/callback?next=${encodeURIComponent("/restablecer")}`,
  });
  if (error?.status === 429 || error?.code === "over_email_send_rate_limit") {
    return { message: "Ya enviamos un correo hace poco. Espera un minuto e inténtalo de nuevo." };
  }
  if (error) console.error("requestPasswordReset:", error);
  return {
    ok: true,
    message: `Si ${parsed.data.email} tiene una cuenta, te enviamos un enlace para crear una contraseña nueva.`,
  };
}

/** Guarda la contraseña nueva. Requiere la sesión temporal que crea el enlace del correo. */
export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = resetSchema.safeParse({ password: str(formData, "password"), confirm: str(formData, "confirm") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { message: "El enlace expiró. Solicita uno nuevo desde «¿Olvidaste tu contraseña?»." };

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return { errors: { password: ["Elige una contraseña distinta a la actual"] } };
    if (error.code === "weak_password") return { errors: { password: ["Esa contraseña es demasiado débil o ya apareció en filtraciones"] } };
    console.error("updatePassword:", error);
    return { message: "No pudimos actualizar tu contraseña. Inténtalo de nuevo." };
  }
  redirect("/");
}

export async function signInWithGoogle(formData: FormData) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin") ?? getSiteUrl();
  const next = safeNext(str(formData, "next"));
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error || !data.url) redirect("/login?error=oauth");
  redirect(data.url);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

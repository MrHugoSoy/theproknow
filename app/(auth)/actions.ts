"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSiteUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, safeNext, type AuthState } from "@/lib/validation/auth";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({ email: str(formData, "email"), password: str(formData, "password") });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      message:
        error.code === "email_not_confirmed"
          ? "Confirma tu correo antes de iniciar sesión. Revisa tu bandeja de entrada."
          : "Correo o contraseña incorrectos.",
    };
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

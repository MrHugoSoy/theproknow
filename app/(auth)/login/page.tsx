import type { Metadata } from "next";
import Link from "next/link";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { LoginForm } from "@/components/auth/LoginForm";
import { safeNext } from "@/lib/validation/auth";

export const metadata: Metadata = { title: "Iniciar sesión" };

const ERRORS: Record<string, string> = {
  oauth: "No pudimos iniciar sesión con Google. Inténtalo de nuevo.",
  callback: "El enlace expiró o ya fue usado. Inicia sesión de nuevo.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;
  const safe = safeNext(next);
  return (
    <>
      <h1 className="text-2xl font-extrabold text-ink">Bienvenido de nuevo</h1>
      <p className="mt-1 text-sm text-muted">Inicia sesión para seguir aprendiendo de quienes saben.</p>
      {error && ERRORS[error] ? (
        <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {ERRORS[error]}
        </p>
      ) : null}
      <div className="mt-6 space-y-5">
        <GoogleButton next={safe} />
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-line" /> o con tu correo <span className="h-px flex-1 bg-line" />
        </div>
        <LoginForm next={safe} />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/registro" className="font-semibold text-brand hover:underline">
          Regístrate
        </Link>
      </p>
    </>
  );
}

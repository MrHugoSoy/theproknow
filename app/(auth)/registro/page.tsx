import type { Metadata } from "next";
import Link from "next/link";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegisterPage() {
  return (
    <>
      <h1 className="text-2xl font-extrabold text-ink">Crea tu cuenta</h1>
      <p className="mt-1 text-sm text-muted">Comparte lo que sabes y aprende de la comunidad.</p>
      <div className="mt-6 space-y-5">
        <GoogleButton />
        <div className="flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-line" /> o con tu correo <span className="h-px flex-1 bg-line" />
        </div>
        <RegisterForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Inicia sesión
        </Link>
      </p>
    </>
  );
}

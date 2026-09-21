import type { Metadata } from "next";
import Link from "next/link";
import { RecoverForm } from "@/components/auth/RecoverForm";

export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false, follow: true } };

export default function RecoverPage() {
  return (
    <>
      <h1 className="text-2xl font-extrabold text-ink">Recupera tu contraseña</h1>
      <p className="mt-1 text-sm text-muted">Escribe tu correo y te enviaremos un enlace para crear una contraseña nueva.</p>
      <div className="mt-6">
        <RecoverForm />
      </div>
      <p className="mt-6 text-center text-sm text-muted">
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Volver a iniciar sesión
        </Link>
      </p>
    </>
  );
}

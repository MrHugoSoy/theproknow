import type { Metadata } from "next";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false } };

/** 404 para URLs que no coinciden con ninguna ruta (sin el layout con navbar). */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 rounded-xl bg-navy px-5 py-3">
        <Logo />
      </div>
      <p className="text-5xl font-extrabold text-brand">404</p>
      <h1 className="mt-2 text-2xl font-extrabold text-ink">Página no encontrada</h1>
      <p className="mt-1 max-w-sm text-sm text-muted">La dirección que buscas no existe o cambió de lugar.</p>
      <Link href="/" className={buttonStyles("primary", "lg", "mt-6")}>
        Ir al inicio
      </Link>
    </main>
  );
}

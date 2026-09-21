"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/** Pantalla de error recuperable (error boundary de Next). */
export function ErrorView({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center" role="alert">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
        <TriangleAlert className="size-6" aria-hidden />
      </span>
      <h1 className="text-lg font-bold text-ink">Algo salió mal</h1>
      <p className="mt-1 max-w-sm text-sm text-muted">
        No pudimos cargar esta página. Puede ser algo temporal: inténtalo de nuevo en unos segundos.
      </p>
      {error.digest ? <p className="mt-2 text-xs text-muted">Código de referencia: {error.digest}</p> : null}
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <button type="button" onClick={reset} className={buttonStyles("primary")}>
          Reintentar
        </button>
        <Link href="/" className={buttonStyles("secondary")}>
          Ir al inicio
        </Link>
      </div>
    </Card>
  );
}

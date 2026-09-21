"use client";

// Último recurso: se muestra si falla el propio layout raíz, por eso incluye <html> y <body>
// y usa solo estilos en línea (no depende del CSS de la app).
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="es-MX">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#F5F7FB", color: "#0F172A" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 16, textAlign: "center" }}>
          <div>
            <h1 style={{ fontSize: 22, margin: "0 0 8px" }}>Algo salió mal</h1>
            <p style={{ margin: "0 0 16px", color: "#5F6E85" }}>Ocurrió un error inesperado. Inténtalo de nuevo.</p>
            <button
              type="button"
              onClick={reset}
              style={{ background: "#2563EB", color: "#fff", border: 0, borderRadius: 8, padding: "10px 18px", fontWeight: 600, cursor: "pointer" }}
            >
              Reintentar
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}

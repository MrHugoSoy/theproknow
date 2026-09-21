export const SITE_NAME = "TheProKnow";
export const SITE_TAGLINE = "Aprende de quienes saben";
export const SITE_DESCRIPTION =
  "Red social de conocimiento en español: comparte consejos, preguntas, tutoriales y artículos con quienes saben.";

/** Se queda solo con el origen (https://dominio) aunque la variable traiga una ruta o una "/" final. */
export function normalizeOrigin(raw: string | undefined, fallback: string): string {
  if (!raw) return fallback;
  try {
    return new URL(raw.includes("://") ? raw : `https://${raw}`).origin;
  } catch {
    return fallback;
  }
}

/**
 * URL pública canónica. Prioridad: NEXT_PUBLIC_SITE_URL → dominio de producción de Vercel → localhost.
 */
export const SITE_URL = normalizeOrigin(
  process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined),
  "http://localhost:3000",
);

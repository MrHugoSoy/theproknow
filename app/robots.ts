import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Áreas privadas o sin valor para buscadores
        disallow: ["/ajustes", "/notificaciones", "/guardados", "/publicar", "/buscar", "/mensajes", "/auth/", "/login", "/registro", "/recuperar", "/restablecer"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}

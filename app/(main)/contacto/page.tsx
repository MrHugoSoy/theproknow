import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";

export const metadata: Metadata = { title: "Contacto" };

export default function ContactPage() {
  return (
    <InfoPage title="Contacto">
      <p>Estamos preparando un canal de contacto directo.</p>
      <p>
        Mientras tanto, si ves contenido que incumple las normas, usa la opción <strong>Reportar</strong> del menú «⋯» de la
        publicación o del comentario.
      </p>
    </InfoPage>
  );
}

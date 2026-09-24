import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";

export const metadata: Metadata = { title: "Sobre TheProKnow" };

export default function AboutPage() {
  return (
    <InfoPage title="Sobre TheProKnow">
      <p>
        <strong>TheProKnow</strong> es una red social de conocimiento en español. Creemos que casi todas las personas saben
        algo que a otras les ahorraría horas de prueba y error, y queremos que compartirlo sea fácil.
      </p>
      <h2>Qué puedes hacer</h2>
      <ul>
        <li>Compartir consejos, tutoriales y artículos.</li>
        <li>Hacer preguntas y elegir la respuesta que mejor te ayudó.</li>
        <li>Seguir a expertos y unirte a comunidades por tema.</li>
        <li>Ganar reputación cuando lo que compartes es útil para otras personas.</li>
      </ul>
      <h2>Comunidades</h2>
      <p>Hay seis comunidades abiertas: Diseño Gráfico, Fotografía, Carpintería, Inteligencia Artificial, Negocios y Productividad. Únete a las que te interesen y comparte lo que sabes.</p>
    </InfoPage>
  );
}

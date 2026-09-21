import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";

export const metadata: Metadata = { title: "Términos" };

export default function TermsPage() {
  return (
    <InfoPage title="Términos de uso" draft>
      <h2>Tu contenido</h2>
      <p>Eres responsable de lo que publicas. Comparte solo contenido propio o que tengas derecho a compartir.</p>
      <h2>Convivencia</h2>
      <ul>
        <li>Sin spam ni publicidad no solicitada.</li>
        <li>Sin acoso, insultos ni contenido ofensivo.</li>
        <li>Sin información deliberadamente falsa o engañosa.</li>
      </ul>
      <h2>Moderación</h2>
      <p>
        Cualquier persona puede reportar contenido. Las publicaciones que reciben varios reportes se ocultan mientras se revisan, y
        podemos retirar contenido o cuentas que incumplan estas normas.
      </p>
      <h2>Reputación</h2>
      <p>Los puntos de reputación se ganan por la utilidad de tus aportes y no tienen valor monetario.</p>
    </InfoPage>
  );
}

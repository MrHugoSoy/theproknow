import type { Metadata } from "next";
import { InfoPage } from "@/components/layout/InfoPage";

export const metadata: Metadata = { title: "Privacidad" };

export default function PrivacyPage() {
  return (
    <InfoPage title="Privacidad" draft>
      <h2>Qué datos guardamos</h2>
      <ul>
        <li>Datos de tu cuenta: correo, nombre, nombre de usuario y, si la subes, tu foto.</li>
        <li>Lo que publicas: publicaciones, comentarios, reacciones, guardados y a quién sigues.</li>
        <li>Si entras con Google, recibimos tu nombre, correo y foto de perfil.</li>
      </ul>
      <h2>Qué es público</h2>
      <p>
        Tu perfil, tus publicaciones y tus comentarios son públicos. Tus guardados, tus reacciones (me gusta y «me ayudó») y tus
        notificaciones son privados.
      </p>
      <h2>Dónde se almacena</h2>
      <p>Los datos se guardan en Supabase. No vendemos tus datos ni mostramos publicidad.</p>
      <h2>Tus derechos</h2>
      <p>Puedes editar tu perfil en Ajustes y borrar tus comentarios cuando quieras.</p>
    </InfoPage>
  );
}

import type { Metadata } from "next";
import { ResetForm } from "@/components/auth/ResetForm";

export const metadata: Metadata = { title: "Nueva contraseña", robots: { index: false, follow: false } };

export default function ResetPage() {
  return (
    <>
      <h1 className="text-2xl font-extrabold text-ink">Crea una contraseña nueva</h1>
      <p className="mt-1 text-sm text-muted">Elige una contraseña que no uses en otros sitios.</p>
      <div className="mt-6">
        <ResetForm />
      </div>
    </>
  );
}

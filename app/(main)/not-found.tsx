import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonStyles } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function MainNotFound() {
  return (
    <EmptyState
      headingAs="h1"
      icon={SearchX}
      title="No encontramos lo que buscabas"
      description="La página no existe, se movió o fue eliminada. Revisa el enlace o vuelve al inicio."
      action={
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/" className={buttonStyles("primary")}>
            Ir al inicio
          </Link>
          <Link href="/explorar" className={buttonStyles("secondary")}>
            Explorar
          </Link>
        </div>
      }
    />
  );
}

import Link from "next/link";
import { CircleHelp, FileText, GraduationCap, Image as ImageIcon, Lightbulb, type LucideIcon } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const CHIPS: { tipo: string; label: string; icon: LucideIcon }[] = [
  { tipo: "consejo", label: "Consejo", icon: Lightbulb },
  { tipo: "pregunta", label: "Pregunta", icon: CircleHelp },
  { tipo: "tutorial", label: "Tutorial", icon: GraduationCap },
  { tipo: "articulo", label: "Artículo", icon: FileText },
  { tipo: "imagen", label: "Imagen", icon: ImageIcon },
];

export function Composer({ displayName, avatarUrl }: { displayName: string; avatarUrl: string | null }) {
  return (
    <Card className="p-4 sm:p-5" aria-label="Crear publicación">
      <div className="flex items-center gap-3">
        <Avatar name={displayName} src={avatarUrl} size="md" />
        <Link
          href="/publicar"
          className="flex h-11 flex-1 items-center rounded-xl border border-line bg-surface px-4 text-sm text-muted hover:bg-white"
        >
          ¿Qué consejo quieres compartir hoy?
        </Link>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {CHIPS.map(({ tipo, label, icon: Icon }) => (
          <Link
            key={tipo}
            href={`/publicar?tipo=${tipo}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-line bg-white px-3 text-xs font-medium text-ink shadow-sm hover:bg-surface"
          >
            <Icon className="size-3.5" aria-hidden />
            {label}
          </Link>
        ))}
        <Link href="/publicar" className={buttonStyles("primary", "md", "ml-auto")}>
          Publicar
        </Link>
      </div>
    </Card>
  );
}

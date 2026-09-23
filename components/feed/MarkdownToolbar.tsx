import { Bold, Code, Heading2, Italic, Link2, List, Quote, type LucideIcon } from "lucide-react";

type Action = "bold" | "italic" | "code" | "link" | "heading" | "list" | "quote";

const BUTTONS: { action: Action; label: string; icon: LucideIcon }[] = [
  { action: "bold", label: "Negrita", icon: Bold },
  { action: "italic", label: "Cursiva", icon: Italic },
  { action: "heading", label: "Título", icon: Heading2 },
  { action: "list", label: "Lista", icon: List },
  { action: "quote", label: "Cita", icon: Quote },
  { action: "code", label: "Código en línea", icon: Code },
  { action: "link", label: "Enlace", icon: Link2 },
];

/** Barra de formato Markdown para el textarea de contenido. */
export function MarkdownToolbar({ onAction }: { onAction: (action: Action) => void }) {
  return (
    <div role="toolbar" aria-label="Formato de texto" className="flex flex-wrap gap-1 rounded-t-xl border border-b-0 border-line bg-surface p-1.5">
      {BUTTONS.map(({ action, label, icon: Icon }) => (
        <button
          key={action}
          type="button"
          title={label}
          aria-label={label}
          onClick={() => onAction(action)}
          className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-white hover:text-ink"
        >
          <Icon className="size-4" aria-hidden />
        </button>
      ))}
    </div>
  );
}

export type { Action as MarkdownAction };

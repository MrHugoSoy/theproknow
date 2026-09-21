import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  /** h1 cuando este estado es lo único que hay en la página (404, mensajes…); h2 dentro de otras secciones */
  headingAs?: "h1" | "h2";
};

export function EmptyState({ icon: Icon, title, description, action, headingAs: Heading = "h2" }: Props) {
  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon className="size-6" aria-hidden />
      </span>
      <Heading className="text-base font-bold text-ink">{title}</Heading>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}

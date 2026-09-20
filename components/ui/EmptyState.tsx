import type { LucideIcon } from "lucide-react";
import { Card } from "./Card";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Icon className="size-6" aria-hidden />
      </span>
      <h2 className="text-base font-bold text-ink">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </Card>
  );
}

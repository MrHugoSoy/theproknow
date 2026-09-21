import Link from "next/link";
import { cn } from "@/lib/utils";

export const FEED_TABS = [
  { key: "para-ti", label: "Para ti" },
  { key: "siguiendo", label: "Siguiendo" },
  { key: "tendencias", label: "Tendencias" },
  { key: "nuevos", label: "Nuevos" },
] as const;

export type FeedTab = (typeof FEED_TABS)[number]["key"];

export function parseTab(value: string | string[] | undefined, allowed?: readonly FeedTab[], fallback: FeedTab = "para-ti"): FeedTab {
  const v = Array.isArray(value) ? value[0] : value;
  const pool = allowed ?? FEED_TABS.map((t) => t.key);
  return (pool as readonly string[]).includes(v ?? "") ? (v as FeedTab) : fallback;
}

type Props = {
  active: FeedTab;
  basePath?: string;
  /** subconjunto de pestañas a mostrar (por defecto, las cuatro) */
  tabs?: readonly FeedTab[];
  /** pestaña que vive en `basePath` sin `?tab=` */
  defaultTab?: FeedTab;
};

/** Tabs por URL (?tab=): funcionan sin JS y se pueden compartir. */
export function FeedTabs({ active, basePath = "/", tabs, defaultTab = "para-ti" }: Props) {
  const shown = tabs ? FEED_TABS.filter((t) => tabs.includes(t.key)) : FEED_TABS;
  return (
    <nav aria-label="Ordenar publicaciones" className="border-b border-line">
      <ul className="flex gap-1 overflow-x-auto px-1">
        {shown.map((t) => {
          const on = t.key === active;
          return (
            <li key={t.key}>
              <Link
                href={t.key === defaultTab ? basePath : `${basePath}?tab=${t.key}`}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "-mb-px block whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium",
                  on ? "border-brand font-semibold text-brand" : "border-transparent text-muted hover:text-ink",
                )}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

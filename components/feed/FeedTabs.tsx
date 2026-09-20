import Link from "next/link";
import { cn } from "@/lib/utils";

export const FEED_TABS = [
  { key: "para-ti", label: "Para ti" },
  { key: "siguiendo", label: "Siguiendo" },
  { key: "tendencias", label: "Tendencias" },
  { key: "nuevos", label: "Nuevos" },
] as const;

export type FeedTab = (typeof FEED_TABS)[number]["key"];

export function parseTab(value: string | string[] | undefined): FeedTab {
  const v = Array.isArray(value) ? value[0] : value;
  return FEED_TABS.some((t) => t.key === v) ? (v as FeedTab) : "para-ti";
}

/** Tabs por URL (?tab=): funcionan sin JS y se pueden compartir. */
export function FeedTabs({ active, basePath = "/" }: { active: FeedTab; basePath?: string }) {
  return (
    <nav aria-label="Ordenar publicaciones" className="border-b border-line">
      <ul className="flex gap-1 overflow-x-auto px-1">
        {FEED_TABS.map((t) => {
          const on = t.key === active;
          return (
            <li key={t.key}>
              <Link
                href={t.key === "para-ti" ? basePath : `${basePath}?tab=${t.key}`}
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

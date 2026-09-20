import Link from "next/link";
import { Crown, Ellipsis } from "lucide-react";
import { CommunityIcon } from "@/components/ui/CommunityIcon";
import { Logo } from "@/components/ui/Logo";
import type { CommunitySummary } from "@/lib/types";
import { SidebarNav } from "./SidebarNav";

type Props = {
  username: string;
  unreadNotifications: number;
  communities: CommunitySummary[];
};

export function SidebarLeft({ username, unreadNotifications, communities }: Props) {
  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 flex-col overflow-y-auto px-3 py-5 md:flex">
      <SidebarNav username={username} unreadNotifications={unreadNotifications} />

      <div className="mt-4 border-t border-line pt-4">
        <h2 className="px-3 text-sm font-bold text-ink">Comunidades</h2>
        <ul className="mt-2 space-y-0.5">
          {communities.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/c/${c.slug}`}
                className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-ink hover:bg-white hover:shadow-card"
              >
                <CommunityIcon icon={c.icon} />
                <span className="flex-1 truncate" title={c.isActive ? undefined : "Próximamente"}>
                  {c.name}
                  {!c.isActive ? <span className="sr-only"> (Próximamente)</span> : null}
                </span>
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/explorar"
              className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm text-muted hover:bg-white hover:shadow-card"
            >
              <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100">
                <Ellipsis className="size-4" aria-hidden />
              </span>
              Todas las categorías
            </Link>
          </li>
        </ul>
      </div>

      <div className="mt-auto space-y-6 pt-8">
        <div className="rounded-card border border-line bg-white/70 p-4 text-center shadow-card">
          <Crown className="mx-auto size-6 text-amber-500" aria-hidden />
          <p className="mt-2 text-[13px] font-bold text-ink">Haz crecer tu impacto</p>
          <p className="mt-1 text-xs text-muted">Obtén verificación, estadísticas avanzadas y más.</p>
          <button
            type="button"
            disabled
            title="Próximamente"
            className="mt-3 h-9 w-full cursor-not-allowed rounded-lg bg-brand text-sm font-semibold text-white opacity-60"
          >
            Hazte Pro
          </button>
          <p className="mt-1.5 text-[11px] text-muted">Próximamente</p>
        </div>
        <Logo tone="light" />
      </div>
    </aside>
  );
}

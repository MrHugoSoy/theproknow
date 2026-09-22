import Link from "next/link";
import { Bell, MessageSquare, Plus, Search } from "lucide-react";
import { CountBadge } from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import type { Viewer } from "@/lib/data/viewer";
import { AccountMenu } from "./AccountMenu";

export function Navbar({ viewer }: { viewer: Viewer | null }) {
  const iconBtn =
    "relative flex size-10 items-center justify-center rounded-full text-white/90 hover:bg-white/10";

  return (
    <header className="sticky top-0 z-50 h-14 bg-navy text-white">
      <div className="mx-auto flex h-full max-w-[1400px] items-center gap-3 px-4">
        <Logo className="shrink-0" tagline={false} />

        <form action="/buscar" role="search" className="mx-auto hidden w-full max-w-md md:block">
          <label htmlFor="q" className="sr-only">
            Buscar consejos, expertos y temas
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-300"
              aria-hidden
            />
            <input
              id="q"
              name="q"
              type="search"
              placeholder="Buscar consejos, expertos, temas…"
              className="h-10 w-full rounded-full bg-white/10 pl-10 pr-4 text-sm text-white placeholder:text-slate-300 focus-visible:bg-white/15"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 md:ml-0">
          <Link href="/buscar" aria-label="Buscar" className={`${iconBtn} md:hidden`}>
            <Search className="size-5" aria-hidden />
          </Link>

          {viewer ? (
            <>
              <Link
                href="/notificaciones"
                aria-label={
                  viewer.unreadNotifications > 0
                    ? `Notificaciones, ${viewer.unreadNotifications} sin leer`
                    : "Notificaciones"
                }
                className={iconBtn}
              >
                <Bell className="size-5" aria-hidden />
                <CountBadge
                  count={viewer.unreadNotifications}
                  className="pointer-events-none absolute right-0.5 top-0.5 !min-w-4 !px-1 text-[10px] !leading-4"
                />
              </Link>
              <Link href="/mensajes" aria-label="Mensajes" className={`${iconBtn} hidden sm:flex`}>
                <MessageSquare className="size-5" aria-hidden />
              </Link>
              <AccountMenu
                displayName={viewer.displayName}
                username={viewer.username}
                avatarUrl={viewer.avatarUrl}
              />
              <Link
                href="/publicar"
                aria-label="Publicar"
                className={buttonStyles("primary", "md", "ml-1 max-sm:w-10 max-sm:px-0")}
              >
                <Plus className="size-4" aria-hidden />
                <span className="hidden sm:inline">Publicar</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="hidden h-10 items-center rounded-lg px-3 text-sm font-medium hover:bg-white/10 sm:inline-flex">
                Iniciar sesión
              </Link>
              <Link href="/registro" className={buttonStyles("primary", "md")}>
                Crear cuenta
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

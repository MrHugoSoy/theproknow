"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavItems, isActive } from "./nav-items";

const MOBILE_HREFS_EXCLUDE = new Set(["/guardados"]);

/** Bottom-nav de 5 íconos para móvil (Guardados vive dentro del perfil). */
export function BottomNav({
  username,
  unreadNotifications,
}: {
  username: string | null;
  unreadNotifications: number;
}) {
  const pathname = usePathname();
  const items = getNavItems(username).filter((i) => !MOBILE_HREFS_EXCLUDE.has(i.href));
  return (
    <nav
      aria-label="Navegación móvil"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-14 items-center justify-center",
                  active ? "text-brand" : "text-muted",
                )}
              >
                <Icon className="size-6" aria-hidden />
                {badge === "notifications" && unreadNotifications > 0 ? (
                  <span
                    aria-label={`${unreadNotifications} notificaciones sin leer`}
                    className="absolute right-1/2 top-2.5 -mr-5 size-2.5 rounded-full bg-red-500 ring-2 ring-white"
                  />
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

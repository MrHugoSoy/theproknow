"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CountBadge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import { getNavItems, isActive } from "./nav-items";

export function SidebarNav({
  username,
  unreadNotifications,
}: {
  username: string;
  unreadNotifications: number;
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Principal">
      <ul className="space-y-1">
        {getNavItems(username).map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(pathname, href);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-soft font-semibold text-brand"
                    : "text-ink hover:bg-white hover:shadow-card",
                )}
              >
                <Icon className={cn("size-5", active ? "text-brand" : "text-muted")} aria-hidden />
                <span className="flex-1">{label}</span>
                {badge === "notifications" ? <CountBadge count={unreadNotifications} /> : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

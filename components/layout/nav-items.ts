import {
  Bell,
  Bookmark,
  Compass,
  Home,
  LogIn,
  MessageSquare,
  User,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  badge?: "notifications";
};

/** `username` null = visitante sin sesión. */
export function getNavItems(username: string | null): NavItem[] {
  if (!username) {
    return [
      { href: "/", label: "Inicio", icon: Home },
      { href: "/explorar", label: "Explorar", icon: Compass },
      { href: "/login", label: "Iniciar sesión", icon: LogIn },
    ];
  }
  return [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/explorar", label: "Explorar", icon: Compass },
    { href: "/notificaciones", label: "Notificaciones", icon: Bell, badge: "notifications" },
    { href: "/mensajes", label: "Mensajes", icon: MessageSquare },
    { href: "/guardados", label: "Guardados", icon: Bookmark },
    { href: `/u/${username}`, label: "Mi perfil", icon: User },
  ];
}

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

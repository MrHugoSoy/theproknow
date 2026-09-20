import {
  Bell,
  Bookmark,
  Compass,
  Home,
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

export function getNavItems(username: string): NavItem[] {
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

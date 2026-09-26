"use client";

import { usePathname } from "next/navigation";

/**
 * En el perfil propio, el resumen del usuario del panel derecho repite lo que ya muestra la página:
 * ahí se muestra `own` (p. ej. un checklist) en su lugar. En el resto de rutas, `children`.
 */
export function OwnProfileSlot({
  username,
  own,
  children,
}: {
  username: string;
  own: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const onOwnProfile = pathname.toLowerCase() === `/u/${username}`.toLowerCase();
  return onOwnProfile ? own : children;
}

"use client";

import { useEffect, useRef } from "react";

const NAVBAR_HEIGHT = 56; // h-14

/**
 * Columna que baja con la página y se fija cuando ya se ve completa (sin scroll propio).
 *
 * Un `sticky` normal con `top: 56px` cortaría el final si la columna es más alta que la pantalla.
 * Aquí `top` es negativo en ese caso (altura de la pantalla − altura de la columna): la columna
 * se mueve con la página hasta que su parte inferior toca el borde de la pantalla y ahí se queda.
 * Si cabe entera, simplemente queda fija bajo el navbar.
 */
export function StickyAside({
  children,
  className,
  ...aria
}: React.ComponentProps<"aside">) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const top = Math.min(NAVBAR_HEIGHT, window.innerHeight - el.offsetHeight);
      el.style.top = `${top}px`;
    };
    update();
    const ro = new ResizeObserver(update); // el contenido cambia (cargas, seguir, etc.)
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    // `top` inicial (antes de hidratar); el efecto lo ajusta con la altura real.
    <aside ref={ref} className={className} style={{ top: NAVBAR_HEIGHT }} {...aria}>
      {children}
    </aside>
  );
}

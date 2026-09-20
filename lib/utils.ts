import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/** "1,240" (es-MX) */
export function formatNumber(n: number): string {
  return n.toLocaleString("es-MX");
}

/** "hace 2 horas", "hace 1 día"… */
export function timeAgo(date: Date | string, now: Date = new Date()): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const s = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));
  const units: [number, string, string][] = [
    [60 * 60 * 24 * 365, "año", "años"],
    [60 * 60 * 24 * 30, "mes", "meses"],
    [60 * 60 * 24 * 7, "semana", "semanas"],
    [60 * 60 * 24, "día", "días"],
    [60 * 60, "hora", "horas"],
    [60, "minuto", "minutos"],
  ];
  for (const [secs, one, many] of units) {
    const v = Math.floor(s / secs);
    if (v >= 1) return `hace ${v} ${v === 1 ? one : many}`;
  }
  return "hace un momento";
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

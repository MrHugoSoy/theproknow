import { getLevel } from "@/lib/reputation";
import { cn } from "@/lib/utils";

const TONE: Record<number, string> = {
  1: "bg-slate-100 text-slate-600",
  2: "bg-sky-100 text-sky-700",
  3: "bg-blue-100 text-blue-700",
  4: "bg-violet-100 text-violet-700",
  5: "bg-amber-100 text-amber-800",
};

/** Nivel de reputación (Novato → Maestro) calculado con los mismos umbrales que la base de datos. */
export function LevelBadge({ reputation, className }: { reputation: number; className?: string }) {
  const { level, name } = getLevel(reputation);
  return (
    <span
      title={`${new Intl.NumberFormat("es-MX").format(reputation)} puntos de reputación`}
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4",
        TONE[level],
        className,
      )}
    >
      Nv. {level} · {name}
    </span>
  );
}

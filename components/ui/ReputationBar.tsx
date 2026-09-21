import { getLevel } from "@/lib/reputation";
import { formatNumber } from "@/lib/utils";

/** Barra de progreso hacia el siguiente nivel de reputación. */
export function ReputationBar({ reputation }: { reputation: number }) {
  const lvl = getLevel(reputation);
  return (
    <div className="rounded-xl bg-surface p-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-bold text-ink">Reputación</span>
        <span className="text-sm font-bold text-brand">
          {formatNumber(reputation)} <span className="text-xs font-medium">pts</span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Progreso hacia el siguiente nivel"
        aria-valuenow={lvl.progress}
        aria-valuemin={0}
        aria-valuemax={100}
        className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200"
      >
        <div className="h-full rounded-full bg-brand" style={{ width: `${lvl.progress}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted">
        {lvl.name} · Nivel {lvl.level}
        {lvl.nextLevelAt ? ` · faltan ${formatNumber(lvl.nextLevelAt - reputation)} pts para el siguiente` : " · nivel máximo"}
      </p>
    </div>
  );
}

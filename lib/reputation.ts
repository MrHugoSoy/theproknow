export const LEVELS = [
  { level: 1, name: "Novato", min: 0 },
  { level: 2, name: "Aprendiz", min: 100 },
  { level: 3, name: "Conocedor", min: 500 },
  { level: 4, name: "Experto", min: 2000 },
  { level: 5, name: "Maestro", min: 5000 },
] as const;

export type LevelInfo = {
  level: number;
  name: string;
  /** 0–100 hacia el siguiente nivel (100 en el nivel máximo) */
  progress: number;
  nextLevelAt: number | null;
};

/** Espejo en TypeScript de la función SQL `reputation_level` (Fase 2). */
export function getLevel(points: number): LevelInfo {
  points = Math.max(0, points); // igual que `greatest(coalesce(points,0),0)` en SQL
  let idx = 0;
  LEVELS.forEach((l, i) => {
    if (points >= l.min) idx = i;
  });
  const current = LEVELS[idx]!;
  const next = LEVELS[idx + 1];
  if (!next) {
    return { level: current.level, name: current.name, progress: 100, nextLevelAt: null };
  }
  const progress = Math.round(((points - current.min) / (next.min - current.min)) * 100);
  return { level: current.level, name: current.name, progress, nextLevelAt: next.min };
}

import { describe, expect, it } from "vitest";
import { getLevel } from "./reputation";

// Espejo de la función SQL `reputation_level` (supabase/migrations/20260920000001_schema.sql).
// Cualquier cambio en los umbrales debe reflejarse en ambos lugares.
describe("getLevel", () => {
  it("empieza en Novato con 0 puntos", () => {
    expect(getLevel(0)).toEqual({ level: 1, name: "Novato", progress: 0, nextLevelAt: 100 });
  });

  it("calcula el progreso a mitad de nivel", () => {
    expect(getLevel(50)).toMatchObject({ level: 1, name: "Novato", progress: 50 });
    expect(getLevel(300)).toMatchObject({ level: 2, name: "Aprendiz", progress: 50 });
  });

  it.each([
    [100, 2, "Aprendiz"],
    [500, 3, "Conocedor"],
    [2000, 4, "Experto"],
  ])("en el umbral exacto (%i pts) sube a nivel %i (%s) con progreso 0", (points, level, name) => {
    expect(getLevel(points)).toMatchObject({ level, name, progress: 0 });
  });

  it("un punto antes del umbral se queda en el nivel anterior", () => {
    expect(getLevel(99)).toMatchObject({ level: 1, name: "Novato" });
    expect(getLevel(1999)).toMatchObject({ level: 3, name: "Conocedor" });
  });

  it("Maestro es el nivel máximo: progreso 100 y sin siguiente nivel", () => {
    expect(getLevel(5000)).toEqual({ level: 5, name: "Maestro", progress: 100, nextLevelAt: null });
    expect(getLevel(999_999)).toMatchObject({ level: 5, name: "Maestro", progress: 100, nextLevelAt: null });
  });

  it("nunca deja el progreso fuera de 0-100 ni la reputación negativa", () => {
    expect(getLevel(-50)).toEqual({ level: 1, name: "Novato", progress: 0, nextLevelAt: 100 });
  });
});

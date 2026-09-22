import { describe, expect, it } from "vitest";
import { cn, formatNumber, initials, timeAgo } from "./utils";

describe("cn", () => {
  it("une clases y descarta valores falsy", () => {
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});

describe("formatNumber", () => {
  it("usa separador de miles es-MX", () => {
    expect(formatNumber(1240)).toBe("1,240");
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(1_000_000)).toBe("1,000,000");
  });
});

describe("initials", () => {
  it("toma la primera letra de hasta dos palabras", () => {
    expect(initials("Ana López")).toBe("AL");
    expect(initials("Carlos")).toBe("C");
    expect(initials("Juan Carlos Pérez")).toBe("JC");
  });

  it("ignora espacios repetidos", () => {
    expect(initials("  Ana   López  ")).toBe("AL");
  });
});

describe("timeAgo", () => {
  const now = new Date("2026-01-10T12:00:00Z");

  it("agrupa segundos y minutos recientes como 'hace un momento'", () => {
    expect(timeAgo(new Date("2026-01-10T11:59:31Z"), now)).toBe("hace un momento");
  });

  it("usa singular y plural correctamente", () => {
    expect(timeAgo(new Date("2026-01-10T11:59:00Z"), now)).toBe("hace 1 minuto");
    expect(timeAgo(new Date("2026-01-10T11:30:00Z"), now)).toBe("hace 30 minutos");
    expect(timeAgo(new Date("2026-01-10T11:00:00Z"), now)).toBe("hace 1 hora");
    expect(timeAgo(new Date("2026-01-09T12:00:00Z"), now)).toBe("hace 1 día");
    expect(timeAgo(new Date("2026-01-01T12:00:00Z"), now)).toBe("hace 1 semana");
  });

  it("una fecha futura no da un valor negativo", () => {
    expect(timeAgo(new Date("2026-01-11T12:00:00Z"), now)).toBe("hace un momento");
  });

  it("acepta una fecha como string ISO", () => {
    expect(timeAgo("2026-01-10T11:00:00Z", now)).toBe("hace 1 hora");
  });
});

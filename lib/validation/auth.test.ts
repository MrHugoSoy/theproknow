import { describe, expect, it } from "vitest";
import { loginSchema, recoverSchema, registerSchema, resetSchema, safeNext } from "./auth";

describe("loginSchema", () => {
  it("acepta correo y contraseña válidos", () => {
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
  });

  it("rechaza un correo inválido o una contraseña vacía", () => {
    expect(loginSchema.safeParse({ email: "no-es-correo", password: "x" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = { displayName: "Ana López", username: "ana.lopez", email: "ana@example.com", password: "abcd1234" };

  it("acepta datos válidos y pasa el username a minúsculas", () => {
    const r = registerSchema.safeParse({ ...base, username: "Ana.Lopez" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.username).toBe("ana.lopez");
  });

  it("rechaza un username con mayúsculas fijas, símbolos o muy corto", () => {
    expect(registerSchema.safeParse({ ...base, username: "an" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, username: "ana lopez" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, username: "ana@lopez" }).success).toBe(false);
  });

  it("exige contraseña con letras y números y al menos 8 caracteres", () => {
    expect(registerSchema.safeParse({ ...base, password: "12345678" }).success).toBe(false); // sin letras
    expect(registerSchema.safeParse({ ...base, password: "abcdefgh" }).success).toBe(false); // sin números
    expect(registerSchema.safeParse({ ...base, password: "abc123" }).success).toBe(false); // muy corta
    expect(registerSchema.safeParse({ ...base, password: "abcd1234" }).success).toBe(true);
  });

  it("rechaza un nombre de una sola letra", () => {
    expect(registerSchema.safeParse({ ...base, displayName: "A" }).success).toBe(false);
  });
});

describe("resetSchema", () => {
  it("exige que ambas contraseñas coincidan", () => {
    expect(resetSchema.safeParse({ password: "abcd1234", confirm: "abcd1234" }).success).toBe(true);
    const r = resetSchema.safeParse({ password: "abcd1234", confirm: "distinta1" });
    expect(r.success).toBe(false);
    if (!r.success) expect(r.error.issues[0]?.path).toEqual(["confirm"]);
  });
});

describe("recoverSchema", () => {
  it("solo exige un correo válido", () => {
    expect(recoverSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
    expect(recoverSchema.safeParse({ email: "no-es-correo" }).success).toBe(false);
  });
});

describe("safeNext", () => {
  it("acepta rutas internas", () => {
    expect(safeNext("/publicar")).toBe("/publicar");
    expect(safeNext("/p/123?tab=comentarios")).toBe("/p/123?tab=comentarios");
  });

  it("rechaza URLs externas y protocol-relative (open redirect)", () => {
    expect(safeNext("https://evil.com")).toBe("/");
    expect(safeNext("//evil.com")).toBe("/");
    expect(safeNext("javascript:alert(1)")).toBe("/");
  });

  it("devuelve / cuando no hay valor", () => {
    expect(safeNext(null)).toBe("/");
    expect(safeNext(undefined)).toBe("/");
    expect(safeNext("")).toBe("/");
  });
});

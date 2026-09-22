import { describe, expect, it } from "vitest";
import { profileSchema } from "./profile";

const base = { displayName: "Ana López", username: "analopez", bio: "" };

describe("profileSchema", () => {
  it("acepta un perfil válido con bio vacía", () => {
    const r = profileSchema.safeParse(base);
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.avatarUrl).toBe("");
  });

  it("rechaza un nombre de una letra o un username inválido", () => {
    expect(profileSchema.safeParse({ ...base, displayName: "A" }).success).toBe(false);
    expect(profileSchema.safeParse({ ...base, username: "an" }).success).toBe(false);
    expect(profileSchema.safeParse({ ...base, username: "Ana López" }).success).toBe(false);
  });

  it("rechaza una bio de más de 280 caracteres", () => {
    expect(profileSchema.safeParse({ ...base, bio: "a".repeat(281) }).success).toBe(false);
    expect(profileSchema.safeParse({ ...base, bio: "a".repeat(280) }).success).toBe(true);
  });

  it("recorta espacios y quita caracteres de control de nombre y bio", () => {
    const r = profileSchema.safeParse({ ...base, displayName: "  Ana\u0000 López  ", bio: "  hola  " });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.displayName).toBe("Ana López");
      expect(r.data.bio).toBe("hola");
    }
  });
});

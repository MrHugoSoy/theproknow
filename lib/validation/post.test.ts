import { describe, expect, it } from "vitest";
import { canonicalYouTubeUrl, postEditSchema, postSchema } from "./post";

const VALID_UUID = "b5be35fd-2bdc-43f4-961f-5025b3de3daa";

const base = {
  type: "consejo" as const,
  communityId: VALID_UUID,
  title: "Un título válido",
  body: "Un cuerpo con al menos diez caracteres.",
};

describe("postSchema", () => {
  it("acepta una publicación válida", () => {
    const r = postSchema.safeParse(base);
    expect(r.success).toBe(true);
  });

  it("rechaza un título muy corto o muy largo", () => {
    expect(postSchema.safeParse({ ...base, title: "abcd" }).success).toBe(false);
    expect(postSchema.safeParse({ ...base, title: "a".repeat(141) }).success).toBe(false);
  });

  it("rechaza un cuerpo muy corto", () => {
    expect(postSchema.safeParse({ ...base, body: "corto" }).success).toBe(false);
  });

  it("rechaza un communityId que no es UUID", () => {
    expect(postSchema.safeParse({ ...base, communityId: "no-es-un-uuid" }).success).toBe(false);
  });

  it("recorta y limpia el título y el cuerpo", () => {
    const r = postSchema.safeParse({ ...base, title: "  Título con espacios  ", body: `${base.body}  ` });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.title).toBe("Título con espacios");
      expect(r.data.body).toBe(base.body);
    }
  });

  it("quita caracteres de control del título y el cuerpo", () => {
    const r = postSchema.safeParse({ ...base, title: `Título\u0000 raro` });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.title).toBe("Título raro");
  });

  it("rechaza un video que no sea de YouTube", () => {
    const r = postSchema.safeParse({ ...base, type: "tutorial", videoUrl: "https://vimeo.com/123" });
    expect(r.success).toBe(false);
  });

  it("rechaza un video en un tipo que no es tutorial", () => {
    const r = postSchema.safeParse({ ...base, videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" });
    expect(r.success).toBe(false);
  });

  it("acepta un video de YouTube en un tutorial", () => {
    const r = postSchema.safeParse({
      ...base,
      type: "tutorial",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    });
    expect(r.success).toBe(true);
  });

  it("rechaza un tipo de publicación desconocido", () => {
    expect(postSchema.safeParse({ ...base, type: "spam" }).success).toBe(false);
  });
});

describe("postEditSchema", () => {
  it("requiere postId además de los campos de la publicación", () => {
    expect(postEditSchema.safeParse({ ...base, postId: VALID_UUID }).success).toBe(true);
  });

  it("no exige communityId (el tipo y la comunidad no se editan)", () => {
    const withoutCommunity = { type: base.type, title: base.title, body: base.body };
    expect(postEditSchema.safeParse({ ...withoutCommunity, postId: VALID_UUID }).success).toBe(true);
  });
});

describe("canonicalYouTubeUrl", () => {
  it("normaliza distintas formas de URL al formato watch?v=", () => {
    expect(canonicalYouTubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(
      "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    );
  });

  it("devuelve null para una URL que no es de YouTube", () => {
    expect(canonicalYouTubeUrl("https://vimeo.com/123")).toBeNull();
  });
});

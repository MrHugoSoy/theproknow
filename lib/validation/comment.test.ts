import { describe, expect, it } from "vitest";
import { commentSchema } from "./comment";

const POST_ID = "b5be35fd-2bdc-43f4-961f-5025b3de3daa";
const PARENT_ID = "15502bb1-07aa-4613-a55e-ab32ac76969d";

describe("commentSchema", () => {
  it("acepta un comentario raíz sin parentId", () => {
    const r = commentSchema.safeParse({ postId: POST_ID, body: "Buen consejo" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.parentId).toBeNull();
  });

  it("acepta una respuesta con parentId", () => {
    const r = commentSchema.safeParse({ postId: POST_ID, parentId: PARENT_ID, body: "Gracias" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.parentId).toBe(PARENT_ID);
  });

  it("rechaza un comentario vacío o solo con espacios", () => {
    expect(commentSchema.safeParse({ postId: POST_ID, body: "" }).success).toBe(false);
    expect(commentSchema.safeParse({ postId: POST_ID, body: "   " }).success).toBe(false);
  });

  it("rechaza más de 5000 caracteres", () => {
    expect(commentSchema.safeParse({ postId: POST_ID, body: "a".repeat(5001) }).success).toBe(false);
  });

  it("rechaza un postId o parentId que no sean UUID", () => {
    expect(commentSchema.safeParse({ postId: "no-uuid", body: "hola" }).success).toBe(false);
    expect(commentSchema.safeParse({ postId: POST_ID, parentId: "no-uuid", body: "hola" }).success).toBe(false);
  });

  it("recorta espacios y quita caracteres de control", () => {
    const r = commentSchema.safeParse({ postId: POST_ID, body: "  hola\u0007 mundo  " });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.body).toBe("hola mundo");
  });
});

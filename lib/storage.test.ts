import { describe, expect, it } from "vitest";
import { storagePathFromUrl } from "./storage";

const base = "https://x.supabase.co/storage/v1/object/public";

describe("storagePathFromUrl", () => {
  it("extrae la ruta del bucket indicado", () => {
    expect(storagePathFromUrl(`${base}/covers/u1/a.png`, "covers")).toBe("u1/a.png");
  });
  it("ignora la query string", () => {
    expect(storagePathFromUrl(`${base}/avatars/u1/a.jpg?t=1`, "avatars")).toBe("u1/a.jpg");
  });
  it("devuelve null para otro bucket, URL externa o vacía", () => {
    expect(storagePathFromUrl(`${base}/avatars/u1/a.jpg`, "covers")).toBeNull();
    expect(storagePathFromUrl("https://lh3.googleusercontent.com/a", "avatars")).toBeNull();
    expect(storagePathFromUrl(null, "covers")).toBeNull();
  });
});

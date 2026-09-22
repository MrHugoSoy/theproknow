import { describe, expect, it } from "vitest";
import { markdownToExcerpt, parseYouTubeId, stripControlChars } from "./text";

describe("markdownToExcerpt", () => {
  it("quita negritas, cursivas y código en línea", () => {
    expect(markdownToExcerpt("Usa **negritas**, *cursivas* y `código`.")).toBe("Usa negritas, cursivas y código.");
  });

  it("quita encabezados y viñetas de lista", () => {
    expect(markdownToExcerpt("## Título\n- uno\n- dos\n1. tres")).toBe("Título uno dos tres");
  });

  it("convierte enlaces en su texto visible y quita imágenes", () => {
    expect(markdownToExcerpt("Mira [este enlace](https://x.com) y ![alt](img.png) esto")).toBe(
      "Mira este enlace y esto",
    );
  });

  it("quita bloques de código y citas", () => {
    expect(markdownToExcerpt("```js\nconst x = 1;\n```\n> una cita")).toBe("una cita");
  });

  it("quita #etiquetas pero conserva palabras con # en medio", () => {
    expect(markdownToExcerpt("Consejo útil #diseño #tipografia")).toBe("Consejo útil");
  });

  it("no corta si el texto ya cabe en el máximo", () => {
    expect(markdownToExcerpt("Texto corto", 280)).toBe("Texto corto");
  });

  it("corta por palabra completa y añade elipsis cuando excede el máximo", () => {
    const result = markdownToExcerpt("Una dos tres cuatro cinco seis siete ocho nueve diez", 20);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBeLessThanOrEqual(21);
    expect(result).not.toMatch(/\s…$/); // sin espacio colgante antes de la elipsis
  });
});

describe("stripControlChars", () => {
  it("conserva tabulaciones, saltos de línea y retornos de carro", () => {
    expect(stripControlChars("a\tb\nc\rd")).toBe("a\tb\nc\rd");
  });

  it("quita caracteres de control C0 y DEL", () => {
    expect(stripControlChars("a\u0000b\u0007c\u001fd\u007fe")).toBe("abcde");
  });

  it("no toca texto normal con acentos y emoji", () => {
    expect(stripControlChars("Consejo útil 👍 en español")).toBe("Consejo útil 👍 en español");
  });
});

describe("parseYouTubeId", () => {
  const ID = "dQw4w9WgXcQ";

  it("acepta youtube.com/watch?v=", () => {
    expect(parseYouTubeId(`https://www.youtube.com/watch?v=${ID}`)).toBe(ID);
    expect(parseYouTubeId(`https://youtube.com/watch?v=${ID}&t=30s`)).toBe(ID);
  });

  it("acepta youtu.be corto", () => {
    expect(parseYouTubeId(`https://youtu.be/${ID}`)).toBe(ID);
  });

  it("acepta /embed/, /shorts/ y /live/", () => {
    expect(parseYouTubeId(`https://www.youtube.com/embed/${ID}`)).toBe(ID);
    expect(parseYouTubeId(`https://www.youtube.com/shorts/${ID}`)).toBe(ID);
    expect(parseYouTubeId(`https://www.youtube.com/live/${ID}`)).toBe(ID);
  });

  it("rechaza otros dominios de video", () => {
    expect(parseYouTubeId(`https://vimeo.com/${ID}`)).toBeNull();
    expect(parseYouTubeId("https://evil.com/?redirect=youtube.com")).toBeNull();
  });

  it("rechaza URLs malformadas o protocolos no http(s)", () => {
    expect(parseYouTubeId("no-es-una-url")).toBeNull();
    expect(parseYouTubeId(`javascript:alert(1)`)).toBeNull();
  });

  it("rechaza un id con la longitud o los caracteres incorrectos", () => {
    expect(parseYouTubeId("https://youtu.be/corto")).toBeNull();
    expect(parseYouTubeId("https://youtu.be/<script>ab</script>")).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { insertLink, toggleLinePrefix, wrapSelection } from "./markdown-editor";

describe("wrapSelection", () => {
  it("envuelve el texto seleccionado", () => {
    const r = wrapSelection("hola mundo", { start: 5, end: 10 }, "**", "**", "texto");
    expect(r.value).toBe("hola **mundo**");
    expect(r.selection).toEqual({ start: 7, end: 12 });
  });

  it("usa el placeholder cuando no hay selección", () => {
    const r = wrapSelection("hola ", { start: 5, end: 5 }, "**", "**", "negrita");
    expect(r.value).toBe("hola **negrita**");
    expect(r.selection).toEqual({ start: 7, end: 14 });
  });

  it("funciona con delimitadores asimétricos (código en línea de una palabra)", () => {
    const r = wrapSelection("usa `git`", { start: 4, end: 4 }, "`", "`", "código");
    expect(r.value).toBe("usa `código``git`");
  });
});

describe("toggleLinePrefix", () => {
  it("antepone el prefijo a una sola línea", () => {
    const r = toggleLinePrefix("una línea", { start: 0, end: 0 }, "> ");
    expect(r.value).toBe("> una línea");
  });

  it("antepone el prefijo a varias líneas seleccionadas", () => {
    const r = toggleLinePrefix("uno\ndos\ntres", { start: 0, end: 7 }, "- ");
    expect(r.value).toBe("- uno\n- dos\ntres");
  });

  it("quita el prefijo si todas las líneas ya lo tienen (toggle)", () => {
    const r = toggleLinePrefix("- uno\n- dos", { start: 0, end: 11 }, "- ");
    expect(r.value).toBe("uno\ndos");
  });

  it("solo afecta las líneas tocadas por el cursor, no todo el texto", () => {
    const r = toggleLinePrefix("primera\nsegunda\ntercera", { start: 9, end: 9 }, "## ");
    expect(r.value).toBe("primera\n## segunda\ntercera");
  });

  it("usa la línea completa aunque el cursor esté a mitad de la palabra", () => {
    const r = toggleLinePrefix("hola mundo", { start: 2, end: 2 }, "# ");
    expect(r.value).toBe("# hola mundo");
  });
});

describe("insertLink", () => {
  it("usa el texto seleccionado como etiqueta del enlace", () => {
    const r = insertLink("mira este tutorial", { start: 5, end: 9 });
    expect(r.value).toBe("mira [este](https://) tutorial");
    // la URL queda seleccionada, lista para pegar/escribir encima
    expect(r.value.slice(r.selection.start, r.selection.end)).toBe("https://");
  });

  it("usa un texto por defecto cuando no hay selección", () => {
    const r = insertLink("", { start: 0, end: 0 });
    expect(r.value).toBe("[texto del enlace](https://)");
    expect(r.value.slice(r.selection.start, r.selection.end)).toBe("https://");
  });
});

export type Selection = { start: number; end: number };

/** Envuelve la selección con `before`/`after` (negrita, cursiva, código…). */
export function wrapSelection(
  value: string,
  { start, end }: Selection,
  before: string,
  after: string,
  placeholder: string,
): { value: string; selection: Selection } {
  const selected = value.slice(start, end) || placeholder;
  const next = value.slice(0, start) + before + selected + after + value.slice(end);
  return { value: next, selection: { start: start + before.length, end: start + before.length + selected.length } };
}

/** Antepone (o quita, si ya está) un prefijo a cada línea tocada por la selección (listas, citas, títulos). */
export function toggleLinePrefix(value: string, { start, end }: Selection, prefix: string) {
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;
  const nextBreak = value.indexOf("\n", end);
  const lineEnd = nextBreak === -1 ? value.length : nextBreak;

  const lines = value.slice(lineStart, lineEnd).split("\n");
  const allPrefixed = lines.every((l) => l.startsWith(prefix));
  const nextLines = lines.map((l) => (allPrefixed ? l.slice(prefix.length) : prefix + l));
  const nextChunk = nextLines.join("\n");

  const next = value.slice(0, lineStart) + nextChunk + value.slice(lineEnd);
  return { value: next, selection: { start: lineStart, end: lineStart + nextChunk.length } };
}

/** Inserta `[texto](https://)` y deja seleccionada la URL para pegarla o escribirla de una vez. */
export function insertLink(value: string, { start, end }: Selection, label = "texto del enlace") {
  const text = value.slice(start, end) || label;
  const url = "https://";
  const snippet = `[${text}](${url})`;
  const next = value.slice(0, start) + snippet + value.slice(end);
  const urlStart = start + text.length + 3; // "[" + text + "]("
  return { value: next, selection: { start: urlStart, end: urlStart + url.length } };
}

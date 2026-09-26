/** Ruta del objeto dentro del bucket a partir de su URL pública, o null si la URL no es de ese bucket. */
export function storagePathFromUrl(url: string | null | undefined, bucket: "covers" | "avatars"): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const i = url.indexOf(marker);
  if (i === -1) return null;
  const path = decodeURIComponent(url.slice(i + marker.length).split("?")[0] ?? "");
  return path || null;
}

/**
 * Borra un archivo propio de Storage (best effort: nunca lanza). Solo actúa sobre la carpeta del usuario;
 * además, las políticas RLS del bucket impiden borrar archivos ajenos.
 */
export async function removeOwnedFile(
  supabase: { storage: { from(bucket: string): { remove(paths: string[]): PromiseLike<unknown> } } },
  bucket: "covers" | "avatars",
  url: string | null | undefined,
  userId: string,
): Promise<void> {
  const path = storagePathFromUrl(url, bucket);
  if (!path || !path.startsWith(`${userId}/`)) return;
  try {
    await supabase.storage.from(bucket).remove([path]);
  } catch (e) {
    console.error("removeOwnedFile:", e);
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { SUPABASE_URL } from "@/lib/supabase/env";
import { removeOwnedFile } from "@/lib/storage";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, type ProfileFormState } from "@/lib/validation/profile";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");

export async function updateProfile(_prev: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const parsed = profileSchema.safeParse({
    displayName: str(formData, "displayName"),
    username: str(formData, "username"),
    bio: str(formData, "bio"),
    avatarUrl: str(formData, "avatarUrl"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const v = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { message: "Tu sesión expiró. Inicia sesión de nuevo." };

  // El avatar solo puede venir de la carpeta propia del bucket `avatars` (o ser uno existente, p. ej. de Google).
  const { data: current } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single();
  if (v.avatarUrl && v.avatarUrl !== current?.avatar_url) {
    const allowed = `${SUPABASE_URL}/storage/v1/object/public/avatars/${user.id}/`;
    if (!v.avatarUrl.startsWith(allowed)) {
      return { errors: { avatarUrl: ["La imagen de perfil no es válida. Vuelve a subirla."] } };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: v.displayName,
      username: v.username,
      bio: v.bio || null,
      avatar_url: v.avatarUrl || null,
    })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") return { errors: { username: ["Ese nombre de usuario ya está en uso"] } };
    console.error("updateProfile:", error);
    return { message: "No pudimos guardar los cambios. Inténtalo de nuevo." };
  }

  if (current?.avatar_url && current.avatar_url !== (v.avatarUrl || null)) {
    await removeOwnedFile(supabase, "avatars", current.avatar_url, user.id);
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Cambios guardados.", username: v.username };
}

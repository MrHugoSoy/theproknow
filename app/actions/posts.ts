"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { SUPABASE_URL } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { canonicalYouTubeUrl, postEditSchema, postSchema, type PostFormState } from "@/lib/validation/post";
import type { ActionResult } from "./reactions";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");

export async function createPost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const parsed = postSchema.safeParse({
    type: str(formData, "type"),
    communityId: str(formData, "communityId"),
    title: str(formData, "title"),
    body: str(formData, "body"),
    coverUrl: str(formData, "coverUrl"),
    videoUrl: str(formData, "videoUrl"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const v = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/publicar");

  // La portada solo puede venir de la carpeta propia del bucket `covers`.
  if (v.coverUrl) {
    const allowed = `${SUPABASE_URL}/storage/v1/object/public/covers/${user.id}/`;
    if (!v.coverUrl.startsWith(allowed)) {
      return { errors: { coverUrl: ["La imagen de portada no es válida. Vuelve a subirla."] } };
    }
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      author_id: user.id,
      community_id: v.communityId,
      type: v.type,
      title: v.title,
      body: v.body,
      cover_url: v.coverUrl || null,
      video_url: v.videoUrl ? canonicalYouTubeUrl(v.videoUrl) : null,
    })
    .select("id")
    .single();

  if (error || !data) {
    if (error?.message.includes("rate_limit")) {
      return { message: "Estás publicando muy rápido. Espera un poco antes de crear otra publicación." };
    }
    if (error?.code === "42501") {
      return { errors: { communityId: ["Esa comunidad aún no está disponible para publicar."] } };
    }
    console.error("createPost:", error);
    return { message: "No pudimos publicar. Inténtalo de nuevo en un momento." };
  }

  redirect(`/p/${data.id}`);
}

// Edita título, cuerpo, portada y video de una publicación propia.
export async function updatePost(_prev: PostFormState, formData: FormData): Promise<PostFormState> {
  const parsed = postEditSchema.safeParse({
    postId: str(formData, "postId"),
    type: str(formData, "type"),
    title: str(formData, "title"),
    body: str(formData, "body"),
    coverUrl: str(formData, "coverUrl"),
    videoUrl: str(formData, "videoUrl"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const v = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=/p/${v.postId}/editar`);

  const { data: current } = await supabase
    .from("posts")
    .select("type, cover_url")
    .eq("id", v.postId)
    .eq("author_id", user.id)
    .maybeSingle();
  if (!current) return { message: "No encontramos la publicación o no tienes permiso para editarla." };
  if (current.type !== v.type) return { message: "No se puede cambiar el tipo de una publicación ya creada." };

  // La portada solo puede ser la que ya tenía o una subida a la carpeta propia del bucket.
  if (v.coverUrl && v.coverUrl !== current.cover_url) {
    const allowed = `${SUPABASE_URL}/storage/v1/object/public/covers/${user.id}/`;
    if (!v.coverUrl.startsWith(allowed)) {
      return { errors: { coverUrl: ["La imagen de portada no es válida. Vuelve a subirla."] } };
    }
  }

  const { data, error } = await supabase
    .from("posts")
    .update({
      title: v.title,
      body: v.body,
      cover_url: v.coverUrl || null,
      video_url: v.videoUrl ? canonicalYouTubeUrl(v.videoUrl) : null,
    })
    .eq("id", v.postId)
    .eq("author_id", user.id)
    .select("id");

  if (error || !data?.length) {
    console.error("updatePost:", error);
    return { message: "No pudimos guardar los cambios. Inténtalo de nuevo." };
  }

  revalidatePath(`/p/${v.postId}`);
  revalidatePath("/", "layout");
  redirect(`/p/${v.postId}`);
}

const idSchema = z.string().uuid();

// Elimina una publicación propia. Sus comentarios, reacciones y notificaciones se borran en cascada,
// y la reputación que esas reacciones habían dado se descuenta (triggers).
export async function deletePost(postId: string): Promise<ActionResult> {
  if (!idSchema.safeParse(postId).success) return { ok: false, error: "unknown" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const { data, error } = await supabase.from("posts").delete().eq("id", postId).eq("author_id", user.id).select("id");
  if (error) {
    console.error("deletePost:", error);
    return { ok: false, error: "unknown" };
  }
  if (!data?.length) return { ok: false, error: "forbidden" };

  revalidatePath("/", "layout");
  return { ok: true };
}

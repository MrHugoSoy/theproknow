"use server";

import { redirect } from "next/navigation";
import { SUPABASE_URL } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { canonicalYouTubeUrl, postSchema, type PostFormState } from "@/lib/validation/post";

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

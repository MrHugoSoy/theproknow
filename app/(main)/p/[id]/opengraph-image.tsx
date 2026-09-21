import { z } from "zod";
import { OG_SIZE, ogImage } from "@/lib/og";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";
import { POST_TYPE_LABEL } from "@/lib/types";

export const alt = "Publicación en TheProKnow";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (isSupabaseConfigured() && z.string().uuid().safeParse(id).success) {
    const { data } = await createPublicClient()
      .from("posts")
      .select(
        `title, type,
         author:profiles!posts_author_id_fkey(display_name, username),
         community:communities!posts_community_id_fkey(name)`,
      )
      .eq("id", id)
      .maybeSingle();
    if (data) {
      return ogImage({
        eyebrow: `${POST_TYPE_LABEL[data.type]} · ${data.community.name}`,
        title: data.title,
        subtitle: `por ${data.author.display_name} (@${data.author.username})`,
      });
    }
  }
  return ogImage({ title: "Publicación en TheProKnow" });
}

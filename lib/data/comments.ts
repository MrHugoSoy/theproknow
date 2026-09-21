import { createClient } from "@/lib/supabase/server";
import type { CommentData } from "@/lib/types";

/** Todos los comentarios de un post en orden cronológico (RLS oculta los de posts ocultos). */
export async function getComments(postId: string): Promise<CommentData[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select(
      `id, parent_id, body, is_accepted, created_at,
       author:profiles!comments_author_id_fkey(id, username, display_name, avatar_url, is_verified, reputation)`,
    )
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("getComments:", error);
    return [];
  }
  return data.map((c) => ({
    id: c.id,
    parentId: c.parent_id,
    body: c.body,
    isAccepted: c.is_accepted,
    createdAt: c.created_at,
    author: {
      id: c.author.id,
      username: c.author.username,
      displayName: c.author.display_name,
      avatarUrl: c.author.avatar_url,
      isVerified: c.author.is_verified,
      reputation: c.author.reputation,
    },
  }));
}

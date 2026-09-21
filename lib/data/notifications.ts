import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type NotificationItem = {
  id: string;
  type: Database["public"]["Enums"]["notification_type"];
  read: boolean;
  createdAt: string;
  postId: string | null;
  postTitle: string | null;
  commentId: string | null;
  actor: { username: string; displayName: string; avatarUrl: string | null; isVerified: boolean };
};

export async function getNotifications(userId: string, limit = 50): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(
      `id, type, read, created_at, post_id, comment_id,
       actor:profiles!notifications_actor_id_fkey(username, display_name, avatar_url, is_verified),
       post:posts!notifications_post_id_fkey(title)`,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getNotifications:", error);
    return [];
  }
  return data.map((n) => ({
    id: n.id,
    type: n.type,
    read: n.read,
    createdAt: n.created_at,
    postId: n.post_id,
    postTitle: n.post?.title ?? null,
    commentId: n.comment_id,
    actor: {
      username: n.actor.username,
      displayName: n.actor.display_name,
      avatarUrl: n.actor.avatar_url,
      isVerified: n.actor.is_verified,
    },
  }));
}

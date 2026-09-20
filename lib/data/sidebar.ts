import { cache } from "react";
import { MOCK_EXPERTS, MOCK_TRENDS } from "@/lib/mock";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { AuthorSummary } from "@/lib/types";

export type Expert = AuthorSummary & { area: string; following: boolean };
export type Trend = { tag: string; posts: number };

/** Top de usuarios por reputación (excluye al propio usuario). */
export const getTopExperts = cache(async (viewerId: string | null, limit = 5): Promise<Expert[]> => {
  if (!isSupabaseConfigured()) return MOCK_EXPERTS.map((e) => ({ ...e, following: false }));

  const supabase = await createClient();
  let q = supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, is_verified, reputation, community_members(communities(name))")
    .order("reputation", { ascending: false })
    .limit(limit);
  if (viewerId) q = q.neq("id", viewerId);
  const { data, error } = await q;
  if (error || !data) {
    console.error("getTopExperts:", error);
    return [];
  }

  let followed = new Set<string>();
  if (viewerId && data.length) {
    const { data: f } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", viewerId)
      .in("following_id", data.map((d) => d.id));
    followed = new Set((f ?? []).map((r) => r.following_id));
  }

  return data.map((p) => ({
    id: p.id,
    username: p.username,
    displayName: p.display_name,
    avatarUrl: p.avatar_url,
    isVerified: p.is_verified,
    reputation: p.reputation,
    area: p.community_members?.[0]?.communities?.name ?? "Comunidad TheProKnow",
    following: followed.has(p.id),
  }));
});

/** Etiquetas (#hashtags) más usadas en publicaciones recientes. */
export const getTrendingTags = cache(async (limit = 5): Promise<Trend[]> => {
  if (!isSupabaseConfigured()) return MOCK_TRENDS;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("trending_tags", { p_limit: limit });
  if (error) {
    console.error("getTrendingTags:", error);
    return [];
  }
  return (data ?? []).map((t) => ({ tag: t.tag, posts: Number(t.posts) }));
});

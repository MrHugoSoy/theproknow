import { cache } from "react";
import { MOCK_COMMUNITIES, MOCK_ME, MOCK_UNREAD_NOTIFICATIONS } from "@/lib/mock";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { CommunitySummary } from "@/lib/types";

export type Viewer = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  isVerified: boolean;
  reputation: number;
  posts: number;
  followers: number;
  following: number;
  unreadNotifications: number;
};

/**
 * Usuario autenticado (o null si es visitante).
 * Sin variables de Supabase configuradas devuelve el usuario demo de la Fase 1.
 */
export const getViewer = cache(async (): Promise<Viewer | null> => {
  if (!isSupabaseConfigured()) {
    return { ...MOCK_ME, unreadNotifications: MOCK_UNREAD_NOTIFICATIONS };
  }
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const head = { count: "exact", head: true } as const;
  const [profile, posts, followers, following, unread] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url, reputation, is_verified")
      .eq("id", user.id)
      .single(),
    supabase.from("posts").select("id", head).eq("author_id", user.id),
    supabase.from("follows").select("follower_id", head).eq("following_id", user.id),
    supabase.from("follows").select("following_id", head).eq("follower_id", user.id),
    supabase.from("notifications").select("id", head).eq("user_id", user.id).eq("read", false),
  ]);
  if (!profile.data) return null;
  const p = profile.data;
  return {
    id: p.id,
    username: p.username,
    displayName: p.display_name,
    avatarUrl: p.avatar_url,
    isVerified: p.is_verified,
    reputation: p.reputation,
    posts: posts.count ?? 0,
    followers: followers.count ?? 0,
    following: following.count ?? 0,
    unreadNotifications: unread.count ?? 0,
  };
});

export const getCommunities = cache(async (): Promise<CommunitySummary[]> => {
  if (!isSupabaseConfigured()) return MOCK_COMMUNITIES;
  const supabase = await createClient();
  const { data } = await supabase
    .from("communities")
    .select("id, slug, name, icon, is_active")
    .order("is_active", { ascending: false })
    .order("name");
  return (data ?? []).map((c) => ({ id: c.id, slug: c.slug, name: c.name, icon: c.icon, isActive: c.is_active }));
});

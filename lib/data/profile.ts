import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type ProfilePage = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  reputation: number;
  isVerified: boolean;
  createdAt: string;
  posts: number;
  followers: number;
  following: number;
  communities: { slug: string; name: string; icon: string; isActive: boolean }[];
  viewerFollows: boolean;
};

export const getProfileByUsername = cache(async (username: string, viewerId: string | null): Promise<ProfilePage | null> => {
  if (!/^[a-z0-9_.]{3,30}$/.test(username)) return null;
  const supabase = await createClient();
  const { data: p } = await supabase
    .from("profiles")
    .select(
      `id, username, display_name, avatar_url, bio, reputation, is_verified, created_at,
       community_members(communities(slug, name, icon, is_active))`,
    )
    .eq("username", username)
    .maybeSingle();
  if (!p) return null;

  const head = { count: "exact", head: true } as const;
  const [posts, followers, following, follow] = await Promise.all([
    supabase.from("posts").select("id", head).eq("author_id", p.id),
    supabase.from("follows").select("follower_id", head).eq("following_id", p.id),
    supabase.from("follows").select("following_id", head).eq("follower_id", p.id),
    viewerId
      ? supabase.from("follows").select("following_id").match({ follower_id: viewerId, following_id: p.id }).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  return {
    id: p.id,
    username: p.username,
    displayName: p.display_name,
    avatarUrl: p.avatar_url,
    bio: p.bio,
    reputation: p.reputation,
    isVerified: p.is_verified,
    createdAt: p.created_at,
    posts: posts.count ?? 0,
    followers: followers.count ?? 0,
    following: following.count ?? 0,
    communities: p.community_members
      .map((m) => m.communities)
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .map((c) => ({ slug: c.slug, name: c.name, icon: c.icon, isActive: c.is_active })),
    viewerFollows: Boolean(follow.data),
  };
});

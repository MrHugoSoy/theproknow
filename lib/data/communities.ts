import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CommunityDetail = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  description: string | null;
  isActive: boolean;
  members: number;
  posts: number;
  joined: boolean;
};

const mapRow = (
  c: {
    id: string;
    slug: string;
    name: string;
    icon: string;
    description: string | null;
    is_active: boolean;
    community_members: { count: number }[];
  },
  joinedIds: Set<string>,
  posts = 0,
): CommunityDetail => ({
  id: c.id,
  slug: c.slug,
  name: c.name,
  icon: c.icon,
  description: c.description,
  isActive: c.is_active,
  members: c.community_members[0]?.count ?? 0,
  posts,
  joined: joinedIds.has(c.id),
});

async function joinedSet(viewerId: string | null): Promise<Set<string>> {
  if (!viewerId) return new Set();
  const supabase = await createClient();
  const { data } = await supabase.from("community_members").select("community_id").eq("user_id", viewerId);
  return new Set((data ?? []).map((r) => r.community_id));
}

const COLS = "id, slug, name, icon, description, is_active, community_members(count)";

export const getCommunityBySlug = cache(async (slug: string, viewerId: string | null): Promise<CommunityDetail | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("communities").select(COLS).eq("slug", slug).maybeSingle();
  if (!data) return null;
  const [joined, posts] = await Promise.all([
    joinedSet(viewerId),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("community_id", data.id),
  ]);
  return mapRow(data, joined, posts.count ?? 0);
});

export const listCommunities = cache(async (viewerId: string | null): Promise<CommunityDetail[]> => {
  const supabase = await createClient();
  const [{ data }, joined] = await Promise.all([
    supabase.from("communities").select(COLS).order("is_active", { ascending: false }).order("name"),
    joinedSet(viewerId),
  ]);
  return (data ?? []).map((c) => mapRow(c, joined));
});

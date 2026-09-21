import { createClient } from "@/lib/supabase/server";
import type { AuthorSummary, CommunitySummary } from "@/lib/types";

/** Deja solo caracteres seguros para usar dentro de un filtro `or()` de PostgREST con ILIKE. */
function clean(q: string): string {
  return q.replace(/^#/, "").replace(/[^\p{L}\p{N}\s._-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 60);
}

export async function searchPeople(q: string, limit = 6): Promise<AuthorSummary[]> {
  const term = clean(q);
  if (term.length < 2) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, is_verified, reputation")
    .or(`display_name.ilike.%${term}%,username.ilike.%${term}%`)
    .order("reputation", { ascending: false })
    .limit(limit);
  return (data ?? []).map((p) => ({
    id: p.id,
    username: p.username,
    displayName: p.display_name,
    avatarUrl: p.avatar_url,
    isVerified: p.is_verified,
    reputation: p.reputation,
  }));
}

export async function searchCommunities(q: string): Promise<CommunitySummary[]> {
  const term = clean(q);
  if (term.length < 2) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("communities")
    .select("id, slug, name, icon, is_active")
    .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
    .order("is_active", { ascending: false });
  return (data ?? []).map((c) => ({ id: c.id, slug: c.slug, name: c.name, icon: c.icon, isActive: c.is_active }));
}

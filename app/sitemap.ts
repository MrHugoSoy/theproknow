import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createPublicClient } from "@/lib/supabase/public";

export const revalidate = 3600;

// Límite por sección; el estándar admite hasta 50 000 URLs por sitemap.
const LIMIT = 5000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/explorar`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/sobre`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terminos`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/contacto`, changeFrequency: "yearly", priority: 0.2 },
  ];
  if (!isSupabaseConfigured()) return staticPages;

  const supabase = createPublicClient();
  const [communities, posts, profiles] = await Promise.all([
    supabase.from("communities").select("slug").eq("is_active", true),
    supabase.from("posts").select("id, created_at").order("created_at", { ascending: false }).limit(LIMIT),
    supabase.from("profiles").select("username, created_at").order("reputation", { ascending: false }).limit(LIMIT),
  ]);

  return [
    ...staticPages,
    ...(communities.data ?? []).map((c) => ({
      url: `${SITE_URL}/c/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...(posts.data ?? []).map((p) => ({
      url: `${SITE_URL}/p/${p.id}`,
      lastModified: new Date(p.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...(profiles.data ?? []).map((u) => ({
      url: `${SITE_URL}/u/${u.username}`,
      lastModified: new Date(u.created_at),
      changeFrequency: "weekly" as const,
      priority: 0.4,
    })),
  ];
}

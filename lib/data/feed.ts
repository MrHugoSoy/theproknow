import { getMockPosts } from "@/lib/mock";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { Database } from "@/lib/supabase/database.types";
import { createClient } from "@/lib/supabase/server";
import { markdownToExcerpt } from "@/lib/text";
import type { PostCardData } from "@/lib/types";

export type FeedTab = "para-ti" | "siguiendo" | "tendencias" | "nuevos";
export type FeedCursor = { score: number; id: string };
export type FeedPage = { posts: PostCardData[]; nextCursor: FeedCursor | null };

type FeedRow = { [K in keyof Database["public"]["CompositeTypes"]["feed_row"]]: NonNullable<Database["public"]["CompositeTypes"]["feed_row"][K]> } & {
  cover_url: string | null;
  video_url: string | null;
  author_avatar_url: string | null;
};

const RPC = {
  "para-ti": "feed_para_ti",
  siguiendo: "feed_siguiendo",
  tendencias: "feed_tendencias",
  nuevos: "feed_nuevos",
} as const;

export const FEED_PAGE_SIZE = 10;

type Options = {
  tab: FeedTab;
  cursor?: FeedCursor | null;
  limit?: number;
  communitySlug?: string;
  authorUsername?: string;
};

function toCard(r: FeedRow): PostCardData {
  const answerers = Array.isArray(r.answerers) ? (r.answerers as { display_name: string; avatar_url: string | null }[]) : [];
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    excerpt: markdownToExcerpt(r.body_preview),
    author: {
      id: r.author_id,
      username: r.author_username,
      displayName: r.author_display_name,
      avatarUrl: r.author_avatar_url,
      isVerified: r.author_is_verified,
      reputation: r.author_reputation,
    },
    community: {
      id: r.community_id,
      slug: r.community_slug,
      name: r.community_name,
      icon: r.community_icon,
      isActive: r.community_is_active,
    },
    createdAt: r.created_at,
    coverUrl: r.cover_url,
    likeCount: r.like_count,
    commentCount: r.comment_count,
    saveCount: r.save_count,
    helpfulCount: r.helpful_count,
    answerAuthors: answerers.map((a) => ({ displayName: a.display_name, avatarUrl: a.avatar_url })),
    viewer: {
      liked: r.viewer_liked,
      helpful: r.viewer_helpful,
      saved: r.viewer_saved,
      following: r.viewer_following,
    },
  };
}

/** Una página del feed. Pide `limit + 1` filas para saber si hay más. */
export async function fetchFeed({
  tab,
  cursor,
  limit = FEED_PAGE_SIZE,
  communitySlug,
  authorUsername,
}: Options): Promise<FeedPage> {
  if (!isSupabaseConfigured()) {
    // Modo demo sin Supabase
    return { posts: tab === "siguiendo" ? [] : getMockPosts(), nextCursor: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc(RPC[tab], {
    p_limit: limit + 1,
    p_cursor_score: cursor?.score,
    p_cursor_id: cursor?.id,
    p_community_slug: communitySlug,
    p_author_username: authorUsername,
  });
  if (error) {
    console.error(`fetchFeed(${tab}):`, error);
    throw new Error("No pudimos cargar las publicaciones");
  }

  const rows = (data ?? []) as unknown as FeedRow[];
  const page = rows.slice(0, limit);
  const last = page[page.length - 1];
  return {
    posts: page.map(toCard),
    nextCursor: rows.length > limit && last ? { score: last.score, id: last.id } : null,
  };
}

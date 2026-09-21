"use server";

import { z } from "zod";
import { fetchFeed, type FeedCursor, type FeedPage, type FeedTab } from "@/lib/data/feed";

const schema = z.object({
  tab: z.enum(["para-ti", "siguiendo", "tendencias", "nuevos"]),
  cursor: z.object({
    score: z.number().finite(),
    id: z.string().uuid(),
    asOf: z.string().datetime({ offset: true }),
  }),
  communitySlug: z.string().max(60).optional(),
  authorUsername: z.string().max(30).optional(),
});

/** Siguiente página del feed (llamada desde el cliente con el cursor previo). */
export async function loadMoreFeed(input: {
  tab: FeedTab;
  cursor: FeedCursor;
  communitySlug?: string;
  authorUsername?: string;
}): Promise<FeedPage> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { posts: [], nextCursor: null };
  return fetchFeed(parsed.data);
}

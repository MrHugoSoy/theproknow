"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { loadMoreFeed } from "@/app/actions/feed";
import type { FeedCursor, FeedTab } from "@/lib/data/feed";
import type { PostCardData } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";

type Props = {
  initialPosts: PostCardData[];
  initialCursor: FeedCursor | null;
  tab: FeedTab;
  communitySlug?: string;
  authorUsername?: string;
  query?: string;
  viewerId?: string;
};

/** Lista con carga incremental (scroll infinito + botón de respaldo). */
export function FeedList({ initialPosts, initialCursor, tab, communitySlug, authorUsername, query, viewerId }: Props) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();
  const sentinel = useRef<HTMLDivElement>(null);
  const busy = useRef(false);

  const loadMore = useCallback(() => {
    if (!cursor || busy.current) return;
    busy.current = true;
    setError(false);
    startTransition(async () => {
      try {
        const page = await loadMoreFeed({ tab, cursor, communitySlug, authorUsername, query });
        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p.id));
          return [...prev, ...page.posts.filter((p) => !seen.has(p.id))];
        });
        setCursor(page.nextCursor);
      } catch {
        setError(true);
      } finally {
        busy.current = false;
      }
    });
  }, [cursor, tab, communitySlug, authorUsername, query]);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || !cursor || error) return;
    const io = new IntersectionObserver((entries) => entries[0]?.isIntersecting && loadMore(), {
      rootMargin: "400px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [cursor, error, loadMore]);

  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <PostCard
          key={p.id}
          post={p}
          viewerId={viewerId}
          onDeleted={(id) => setPosts((prev) => prev.filter((x) => x.id !== id))}
        />
      ))}
      {pending ? <PostCardSkeleton /> : null}
      {error ? (
        <div role="alert" className="rounded-card border border-line bg-white p-4 text-center text-sm">
          <p className="text-muted">No pudimos cargar más publicaciones.</p>
          <Button variant="outline" size="sm" className="mt-2" onClick={loadMore}>
            Reintentar
          </Button>
        </div>
      ) : cursor ? (
        <div ref={sentinel} className="flex justify-center py-2">
          <Button variant="secondary" size="sm" onClick={loadMore} disabled={pending}>
            Ver más publicaciones
          </Button>
        </div>
      ) : posts.length > 0 ? (
        <p className="py-4 text-center text-sm text-muted">Llegaste al final. ¡Vuelve pronto por más consejos!</p>
      ) : null}
    </div>
  );
}

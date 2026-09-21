import type { Metadata } from "next";
import Link from "next/link";
import { Star, TrendingUp } from "lucide-react";
import { JoinButton } from "@/components/community/JoinButton";
import { FeedList } from "@/components/feed/FeedList";
import { FollowButton } from "@/components/feed/FollowButton";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { CommunityIcon } from "@/components/ui/CommunityIcon";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { fetchFeed } from "@/lib/data/feed";
import { listCommunities } from "@/lib/data/communities";
import { getTopExperts, getTrendingTags } from "@/lib/data/sidebar";
import { getViewer } from "@/lib/data/viewer";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatNumber } from "@/lib/utils";

export const metadata: Metadata = { title: "Explorar" };

export default async function ExplorePage() {
  const viewer = await getViewer();
  const viewerId = viewer?.id ?? null;
  const [communities, experts, tags, trending] = await Promise.all([
    isSupabaseConfigured() ? listCommunities(viewerId) : Promise.resolve([]),
    getTopExperts(viewerId, 8),
    getTrendingTags(10),
    fetchFeed({ tab: "tendencias", limit: 5 }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Explorar</h1>

      <section aria-labelledby="ex-comunidades">
        <h2 id="ex-comunidades" className="mb-3 px-1 text-lg font-bold text-ink">
          Comunidades
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {communities.map((c) => (
            <Card key={c.id} className="flex items-start gap-3 p-4">
              <CommunityIcon icon={c.icon} className="size-11 rounded-xl [&>svg]:size-5" />
              <div className="min-w-0 flex-1">
                <Link href={`/c/${c.slug}`} className="font-bold text-ink hover:underline">
                  {c.name}
                </Link>
                <p className="line-clamp-2 text-[13px] text-muted">{c.description}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  {c.isActive ? (
                    <>
                      <span className="text-xs text-muted">
                        {formatNumber(c.members)} {c.members === 1 ? "miembro" : "miembros"}
                      </span>
                      <JoinButton communityId={c.id} initialJoined={c.joined} />
                    </>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-muted">Próximamente</span>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {tags.length > 0 ? (
        <section aria-labelledby="ex-tags">
          <h2 id="ex-tags" className="mb-3 px-1 text-lg font-bold text-ink">
            Etiquetas en tendencia
          </h2>
          <ul className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <li key={t.tag}>
                <Link
                  href={`/buscar?q=${encodeURIComponent(`#${t.tag}`)}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm hover:bg-surface"
                >
                  <TrendingUp className="size-3.5 text-brand" aria-hidden />#{t.tag}
                  <span className="text-xs text-muted">{formatNumber(t.posts)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {experts.length > 0 ? (
        <section aria-labelledby="ex-expertos">
          <h2 id="ex-expertos" className="mb-3 px-1 text-lg font-bold text-ink">
            Expertos destacados
          </h2>
          <Card className="divide-y divide-line">
            {experts.map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-4">
                <Avatar name={e.displayName} src={e.avatarUrl} size="lg" />
                <div className="min-w-0 flex-1">
                  <Link href={`/u/${e.username}`} className="flex flex-wrap items-center gap-x-2 font-semibold text-ink hover:underline">
                    {e.displayName} <LevelBadge reputation={e.reputation} />
                  </Link>
                  <p className="flex items-center gap-1 text-xs text-muted">
                    {e.area} · <Star className="size-3 fill-amber-400 text-amber-400" aria-hidden />
                    {formatNumber(e.reputation)} puntos
                  </p>
                </div>
                <FollowButton username={e.username} initialFollowing={e.following} variant="solid" />
              </div>
            ))}
          </Card>
        </section>
      ) : null}

      {trending.posts.length > 0 ? (
        <section aria-labelledby="ex-tendencias">
          <h2 id="ex-tendencias" className="mb-3 px-1 text-lg font-bold text-ink">
            Lo más comentado ahora
          </h2>
          <FeedList initialPosts={trending.posts} initialCursor={trending.nextCursor} tab="tendencias" viewerId={viewer?.id} />
        </section>
      ) : null}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { Search, SearchX } from "lucide-react";
import { FeedList } from "@/components/feed/FeedList";
import { FollowButton } from "@/components/feed/FollowButton";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedCheck } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { CommunityIcon } from "@/components/ui/CommunityIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { fetchFeed } from "@/lib/data/feed";
import { searchCommunities, searchPeople } from "@/lib/data/search";
import { getTrendingTags } from "@/lib/data/sidebar";
import { getViewer } from "@/lib/data/viewer";
import { isSupabaseConfigured } from "@/lib/supabase/env";

type Props = { searchParams: Promise<{ q?: string }> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = ((await searchParams).q ?? "").trim();
  return { title: q ? `Buscar: ${q}` : "Buscar", robots: { index: false } };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const viewer = await getViewer();

  const form = (
    <form action="/buscar" role="search" className="relative">
      <label htmlFor="buscar-q" className="sr-only">
        Buscar consejos, expertos y temas
      </label>
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted" aria-hidden />
      <input
        id="buscar-q"
        name="q"
        type="search"
        defaultValue={q}
        placeholder="Buscar consejos, expertos, temas…"
        className="h-12 w-full rounded-xl border border-line bg-white pl-12 pr-4 text-[15px] shadow-card"
      />
    </form>
  );

  if (!isSupabaseConfigured() || q.length < 2) {
    const tags = isSupabaseConfigured() ? await getTrendingTags(8) : [];
    return (
      <div className="space-y-5">
        <h1 className="sr-only">Buscar</h1>
        {form}
        {q.length === 1 ? <p className="px-1 text-sm text-muted">Escribe al menos 2 caracteres.</p> : null}
        {tags.length > 0 ? (
          <section aria-labelledby="bq-tags">
            <h2 id="bq-tags" className="mb-2 px-1 text-sm font-bold text-ink">
              Prueba con una etiqueta
            </h2>
            <ul className="flex flex-wrap gap-2">
              {tags.map((t) => (
                <li key={t.tag}>
                  <Link
                    href={`/buscar?q=${encodeURIComponent(`#${t.tag}`)}`}
                    className="rounded-full border border-line bg-white px-3 py-1.5 text-sm font-medium text-ink shadow-sm hover:bg-surface"
                  >
                    #{t.tag}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    );
  }

  const [people, communities, { posts, nextCursor }] = await Promise.all([
    searchPeople(q),
    searchCommunities(q),
    fetchFeed({ tab: "nuevos", query: q }),
  ]);
  const nothing = people.length === 0 && communities.length === 0 && posts.length === 0;

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Resultados para {q}</h1>
      {form}

      {nothing ? (
        <EmptyState
          icon={SearchX}
          title={`Sin resultados para «${q}»`}
          description="Revisa la ortografía o prueba con palabras más generales, o con una #etiqueta."
        />
      ) : null}

      {people.length > 0 ? (
        <section aria-labelledby="bq-personas">
          <h2 id="bq-personas" className="mb-2 px-1 text-lg font-bold text-ink">
            Personas
          </h2>
          <Card className="divide-y divide-line">
            {people.map((p) => (
              <div key={p.id} className="flex items-center gap-3 p-4">
                <Avatar name={p.displayName} src={p.avatarUrl} size="md" />
                <div className="min-w-0 flex-1">
                  <Link href={`/u/${p.username}`} className="flex flex-wrap items-center gap-x-2 text-sm font-semibold text-ink hover:underline">
                    {p.displayName}
                    {p.isVerified ? <VerifiedCheck /> : null}
                    <LevelBadge reputation={p.reputation} />
                  </Link>
                  <p className="text-xs text-muted">@{p.username}</p>
                </div>
                {viewer?.id !== p.id ? <FollowButton username={p.username} variant="solid" /> : null}
              </div>
            ))}
          </Card>
        </section>
      ) : null}

      {communities.length > 0 ? (
        <section aria-labelledby="bq-comunidades">
          <h2 id="bq-comunidades" className="mb-2 px-1 text-lg font-bold text-ink">
            Comunidades
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {communities.map((c) => (
              <li key={c.id}>
                <Link href={`/c/${c.slug}`} className="flex items-center gap-3 rounded-card border border-line bg-white p-3 shadow-card hover:bg-surface">
                  <CommunityIcon icon={c.icon} className="size-10 rounded-xl" />
                  <span className="font-semibold text-ink">{c.name}</span>
                  {!c.isActive ? <span className="ml-auto text-xs text-muted">Próximamente</span> : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {posts.length > 0 ? (
        <section aria-labelledby="bq-posts" className="space-y-4">
          <h2 id="bq-posts" className="px-1 text-lg font-bold text-ink">
            Publicaciones
          </h2>
          <FeedList key={q} initialPosts={posts} initialCursor={nextCursor} tab="nuevos" query={q} viewerId={viewer?.id} />
        </section>
      ) : null}
    </div>
  );
}

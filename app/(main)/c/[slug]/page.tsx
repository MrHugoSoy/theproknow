import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, Lightbulb } from "lucide-react";
import { JoinButton } from "@/components/community/JoinButton";
import { FeedList } from "@/components/feed/FeedList";
import { FeedTabs, parseTab } from "@/components/feed/FeedTabs";
import { Card } from "@/components/ui/Card";
import { CommunityIcon } from "@/components/ui/CommunityIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchFeed } from "@/lib/data/feed";
import { getCommunityBySlug } from "@/lib/data/communities";
import { getViewer } from "@/lib/data/viewer";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatNumber } from "@/lib/utils";

type Params = { slug: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  if (!isSupabaseConfigured()) return { title: "Comunidad" };
  const community = await getCommunityBySlug((await params).slug, null);
  if (!community) return { title: "Comunidad no encontrada" };
  return { title: community.name, description: community.description ?? `Comunidad de ${community.name} en TheProKnow.` };
}

const TABS = ["tendencias", "nuevos"] as const;

export default async function CommunityPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ slug }, { tab: rawTab }] = await Promise.all([params, searchParams]);
  if (!isSupabaseConfigured()) notFound();

  const viewer = await getViewer();
  const community = await getCommunityBySlug(slug, viewer?.id ?? null);
  if (!community) notFound();

  const tab = parseTab(rawTab, TABS, "tendencias") as "tendencias" | "nuevos";
  const { posts, nextCursor } = community.isActive
    ? await fetchFeed({ tab, communitySlug: community.slug })
    : { posts: [], nextCursor: null };

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <CommunityIcon icon={community.icon} className="size-14 rounded-2xl [&>svg]:size-7" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-extrabold text-ink">{community.name}</h1>
            <p className="text-sm text-muted">
              {formatNumber(community.members)} {community.members === 1 ? "miembro" : "miembros"} ·{" "}
              {formatNumber(community.posts)} {community.posts === 1 ? "publicación" : "publicaciones"}
            </p>
          </div>
          {community.isActive ? <JoinButton communityId={community.id} initialJoined={community.joined} /> : null}
        </div>
        {community.description ? <p className="mt-4 text-[15px] leading-relaxed text-ink">{community.description}</p> : null}
      </Card>

      {!community.isActive ? (
        <EmptyState
          icon={Clock}
          title="Próximamente"
          description={`La comunidad de ${community.name} abrirá pronto. Mientras tanto, explora Diseño Gráfico y Fotografía.`}
        />
      ) : (
        <>
          <FeedTabs active={tab} basePath={`/c/${community.slug}`} tabs={TABS} defaultTab="tendencias" />
          {posts.length === 0 ? (
            <EmptyState
              icon={Lightbulb}
              title="Aún no hay publicaciones aquí"
              description="Sé la primera persona en compartir algo en esta comunidad."
            />
          ) : (
            <FeedList key={tab} initialPosts={posts} initialCursor={nextCursor} tab={tab} communitySlug={community.slug} viewerId={viewer?.id} />
          )}
        </>
      )}
    </div>
  );
}

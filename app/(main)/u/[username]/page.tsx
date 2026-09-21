import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, Lightbulb } from "lucide-react";
import { FeedList } from "@/components/feed/FeedList";
import { FollowButton } from "@/components/feed/FollowButton";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedCheck } from "@/components/ui/Badge";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CommunityIcon } from "@/components/ui/CommunityIcon";
import { EmptyState } from "@/components/ui/EmptyState";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { ReputationBar } from "@/components/ui/ReputationBar";
import { fetchFeed } from "@/lib/data/feed";
import { getProfileByUsername } from "@/lib/data/profile";
import { getViewer } from "@/lib/data/viewer";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { formatNumber } from "@/lib/utils";

type Params = { username: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  if (!isSupabaseConfigured()) return { title: "Perfil" };
  const { username } = await params;
  const profile = await getProfileByUsername(username, null);
  if (!profile) return { title: "Perfil no encontrado" };
  const title = `${profile.displayName} (@${profile.username})`;
  const description = profile.bio ?? `Perfil de ${profile.displayName} en TheProKnow.`;
  const path = `/u/${profile.username}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "profile", url: path, title, description, siteName: "TheProKnow", locale: "es_MX", username: profile.username },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ProfilePage({ params }: { params: Promise<Params> }) {
  const { username } = await params;
  if (!isSupabaseConfigured()) notFound();

  const viewer = await getViewer();
  const profile = await getProfileByUsername(username, viewer?.id ?? null);
  if (!profile) notFound();

  const isMe = viewer?.id === profile.id;
  const { posts, nextCursor } = await fetchFeed({ tab: "nuevos", authorUsername: profile.username });
  const joined = new Intl.DateTimeFormat("es-MX", { month: "long", year: "numeric" }).format(new Date(profile.createdAt));

  const stats = [
    { label: "Publicaciones", value: profile.posts },
    { label: "Seguidores", value: profile.followers },
    { label: "Siguiendo", value: profile.following },
  ];

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <Avatar name={profile.displayName} src={profile.avatarUrl} size="xl" className="size-20 text-2xl" />
          <div className="min-w-0 flex-1">
            <h1 className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xl font-extrabold text-ink">
              {profile.displayName}
              {profile.isVerified ? <VerifiedCheck className="size-5" /> : null}
              <LevelBadge reputation={profile.reputation} />
            </h1>
            <p className="text-sm text-muted">@{profile.username}</p>
            <p className="mt-1 flex items-center gap-1 text-[13px] text-muted">
              <CalendarDays className="size-4" aria-hidden /> Se unió en {joined}
            </p>
          </div>
          {isMe ? (
            <Link href="/ajustes" className={buttonStyles("secondary", "md")}>
              Editar perfil
            </Link>
          ) : (
            <FollowButton username={profile.username} initialFollowing={profile.viewerFollows} variant="solid" className="h-10 px-5 text-sm" />
          )}
        </div>

        {profile.bio ? <p className="mt-4 whitespace-pre-line text-[15px] leading-relaxed text-ink">{profile.bio}</p> : null}

        <dl className="mt-5 grid grid-cols-3 divide-x divide-line text-center">
          {stats.map((s) => (
            <div key={s.label} className="px-2">
              <dd className="text-xl font-bold text-ink">{formatNumber(s.value)}</dd>
              <dt className="text-xs text-muted">{s.label}</dt>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          <ReputationBar reputation={profile.reputation} />
        </div>

        {profile.communities.length > 0 ? (
          <div className="mt-5">
            <h2 className="mb-2 text-sm font-bold text-ink">Comunidades</h2>
            <ul className="flex flex-wrap gap-2">
              {profile.communities.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/c/${c.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-3 text-[13px] font-medium text-ink hover:bg-surface"
                  >
                    <CommunityIcon icon={c.icon} className="size-6 rounded-full" />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>

      <h2 className="px-1 text-lg font-bold text-ink">Publicaciones</h2>
      {posts.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title={isMe ? "Aún no has publicado nada" : `${profile.displayName} aún no ha publicado`}
          description={
            isMe
              ? "Comparte tu primer consejo, pregunta o tutorial y empieza a construir tu reputación."
              : "Cuando publique algo, lo verás aquí."
          }
          action={
            isMe ? (
              <Link href="/publicar" className={buttonStyles("primary")}>
                Publicar ahora
              </Link>
            ) : undefined
          }
        />
      ) : (
        <FeedList initialPosts={posts} initialCursor={nextCursor} tab="nuevos" authorUsername={profile.username} viewerId={viewer?.id} />
      )}
    </div>
  );
}

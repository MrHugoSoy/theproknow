import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { CommentSection } from "@/components/comments/CommentSection";
import { FollowButton } from "@/components/feed/FollowButton";
import { PostMenu } from "@/components/report/PostMenu";
import { PostActions } from "@/components/feed/PostActions";
import { Avatar } from "@/components/ui/Avatar";
import { PostTypeBadge, VerifiedCheck } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { Markdown } from "@/components/ui/Markdown";
import { getComments } from "@/lib/data/comments";
import { getViewer } from "@/lib/data/viewer";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { markdownToExcerpt, parseYouTubeId } from "@/lib/text";
import { timeAgo } from "@/lib/utils";

type Params = { id: string };

async function getPost(id: string) {
  if (!isSupabaseConfigured() || !z.string().uuid().safeParse(id).success) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select(
      `id, title, body, type, cover_url, video_url, created_at, like_count, helpful_count, comment_count,
       author:profiles!posts_author_id_fkey(id, username, display_name, avatar_url, is_verified, reputation),
       community:communities!posts_community_id_fkey(slug, name)`,
    )
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const post = await getPost((await params).id);
  if (!post) return { title: "Publicación no encontrada" };
  return { title: post.title, description: markdownToExcerpt(post.body, 160) };
}

export default async function PostPage({ params }: { params: Promise<Params> }) {
  const { id } = await params;
  const post = await getPost(id);
  if (!post) notFound();

  const [viewer, comments] = await Promise.all([getViewer(), getComments(post.id)]);
  let viewerState = { liked: false, helpful: false, saved: false };
  let following = false;
  if (viewer) {
    const supabase = await createClient();
    const q = { user_id: viewer.id, post_id: post.id };
    const [l, h, s, f] = await Promise.all([
      supabase.from("likes").select("post_id").match(q).maybeSingle(),
      supabase.from("helpful_marks").select("post_id").match(q).maybeSingle(),
      supabase.from("saves").select("post_id").match(q).maybeSingle(),
      supabase.from("follows").select("following_id").match({ follower_id: viewer.id, following_id: post.author.id }).maybeSingle(),
    ]);
    viewerState = { liked: !!l.data, helpful: !!h.data, saved: !!s.data };
    following = !!f.data;
  }

  const { author, community } = post;
  const isQuestion = post.type === "pregunta";
  const solved = isQuestion && comments.some((c) => c.isAccepted);
  const videoId = post.video_url ? parseYouTubeId(post.video_url) : null;

  return (
    <article className="space-y-4">
      <Card className="p-5 sm:p-6">
        <header className="flex items-center gap-3">
          <Link href={`/u/${author.username}`}>
            <Avatar name={author.display_name} src={author.avatar_url} size="md" />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm font-bold text-ink">
              <Link href={`/u/${author.username}`} className="truncate hover:underline">
                {author.display_name}
              </Link>
              {author.is_verified ? <VerifiedCheck /> : null}
              <LevelBadge reputation={author.reputation} />
            </p>
            <p className="truncate text-[13px] text-muted" suppressHydrationWarning>
              @{author.username} · {timeAgo(post.created_at)} ·{" "}
              <Link href={`/c/${community.slug}`} className="hover:text-ink hover:underline">
                {community.name}
              </Link>
            </p>
          </div>
          {viewer?.id !== author.id && !following ? (
            <FollowButton username={author.username} />
          ) : null}
          <PostMenu postId={post.id} />
        </header>

        <div className="mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <PostTypeBadge type={post.type} />
            {solved ? (
              <span className="inline-block rounded-full bg-helpful-soft px-2.5 py-0.5 text-xs font-semibold text-helpful">
                Resuelta
              </span>
            ) : null}
          </div>
          <h1 className="mt-1.5 text-2xl font-extrabold leading-snug text-ink">{post.title}</h1>
        </div>

        {post.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover_url} alt="" className="mt-4 max-h-96 w-full rounded-xl object-cover" />
        ) : null}

        {videoId ? (
          <div className="mt-4 aspect-video overflow-hidden rounded-xl bg-black">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${videoId}`}
              title={`Video: ${post.title}`}
              loading="lazy"
              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="size-full"
            />
          </div>
        ) : null}

        <Markdown className="mt-4">{post.body}</Markdown>

        <div className="mt-5 border-t border-line pt-3">
          <PostActions
            postId={post.id}
            isQuestion={isQuestion}
            likeCount={post.like_count}
            commentCount={post.comment_count}
            helpfulCount={post.helpful_count}
            initial={viewerState}
          />
        </div>
      </Card>

      <CommentSection
        comments={comments}
        postId={post.id}
        postAuthorId={author.id}
        isQuestion={isQuestion}
        viewerId={viewer?.id ?? null}
      />
    </article>
  );
}

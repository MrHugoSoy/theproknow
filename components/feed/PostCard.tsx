import Link from "next/link";
import { Play } from "lucide-react";
import { Avatar, AvatarStack } from "@/components/ui/Avatar";
import { PostTypeBadge, VerifiedCheck } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { PostMenu } from "@/components/report/PostMenu";
import type { PostCardData } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { FollowButton } from "./FollowButton";
import { PostActions } from "./PostActions";

function Thumbnail({ post }: { post: PostCardData }) {
  if (!post.coverUrl && !post.coverMock) return null;
  return (
    <Link
      href={`/p/${post.id}`}
      tabIndex={-1}
      aria-hidden
      className="relative block h-24 w-28 shrink-0 overflow-hidden rounded-xl sm:h-[110px] sm:w-[172px]"
    >
      {post.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={post.coverUrl} alt="" className="size-full object-cover" loading="lazy" />
      ) : (
        <span
          className="flex size-full items-end p-2 text-[10px] font-extrabold uppercase leading-tight text-white sm:p-3 sm:text-xs"
          style={{ background: `linear-gradient(135deg, ${post.coverMock!.from}, ${post.coverMock!.to})` }}
        >
          {post.coverMock!.text}
        </span>
      )}
      {post.type === "tutorial" ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="flex size-9 items-center justify-center rounded-full bg-black/55 text-white">
            <Play className="size-4 fill-white" aria-hidden />
          </span>
        </span>
      ) : null}
    </Link>
  );
}

export function PostCard({
  post,
  viewerId,
  showFollow = true,
}: {
  post: PostCardData;
  /** id del usuario actual: oculta "Seguir" en sus propias publicaciones */
  viewerId?: string;
  showFollow?: boolean;
}) {
  const { author, community } = post;
  const isQuestion = post.type === "pregunta";

  return (
    <Card as="article" className="p-4 sm:p-5" aria-labelledby={`post-${post.id}-title`}>
      <header className="flex items-start gap-3">
        <Link href={`/u/${author.username}`} tabIndex={-1} aria-hidden>
          <Avatar name={author.displayName} src={author.avatarUrl} size="md" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 text-sm font-bold text-ink">
            <Link href={`/u/${author.username}`} className="truncate hover:underline">
              {author.displayName}
            </Link>
            {author.isVerified ? <VerifiedCheck /> : null}
          </p>
          <p className="truncate text-[13px] text-muted" suppressHydrationWarning>
            @{author.username} · {timeAgo(post.createdAt)}
            {community ? (
              <>
                {" "}
                ·{" "}
                <Link href={`/c/${community.slug}`} className="hover:text-ink hover:underline">
                  {community.name}
                </Link>
              </>
            ) : null}
          </p>
        </div>
        {showFollow && author.id !== viewerId && !post.viewer?.following ? (
          <FollowButton username={author.username} />
        ) : null}
        <PostMenu postId={post.id} />
      </header>

      <div className="mt-3 flex items-start gap-4">
        <div className="min-w-0 flex-1">
          {post.type === "pregunta" || post.type === "tutorial" || post.type === "articulo" ? (
            <div className="mb-1.5">
              <PostTypeBadge type={post.type} />
            </div>
          ) : null}
          <h2 id={`post-${post.id}-title`} className="text-[17px] font-bold leading-snug text-ink">
            <Link href={`/p/${post.id}`} className="hover:text-brand">
              {post.title}
            </Link>
          </h2>
          <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-muted">{post.excerpt}</p>
        </div>
        <Thumbnail post={post} />
      </div>

      <div className="mt-3">
        <PostActions
          postId={post.id}
          isQuestion={isQuestion}
          likeCount={post.likeCount}
          commentCount={post.commentCount}
          helpfulCount={post.helpfulCount}
          initial={post.viewer}
        />
      </div>

      {isQuestion && post.answerAuthors?.length ? (
        <Link
          href={`/p/${post.id}#comentarios`}
          className="mt-2 flex w-fit items-center gap-2 rounded-lg py-1 pr-2 text-sm text-muted hover:text-ink"
        >
          <AvatarStack people={post.answerAuthors.map((a) => ({ name: a.displayName, src: a.avatarUrl }))} />
          Ver {post.commentCount} respuestas
        </Link>
      ) : null}
    </Card>
  );
}

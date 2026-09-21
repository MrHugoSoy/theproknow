"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CircleCheck } from "lucide-react";
import { deleteComment, toggleAcceptedAnswer } from "@/app/actions/comments";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedCheck } from "@/components/ui/Badge";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { Markdown } from "@/components/ui/Markdown";
import type { CommentData } from "@/lib/types";
import { cn, timeAgo } from "@/lib/utils";
import { CommentForm } from "./CommentForm";

type Props = {
  comments: CommentData[];
  postId: string;
  postAuthorId: string;
  isQuestion: boolean;
  viewerId: string | null;
};

export function CommentList({ comments, postId, postAuthorId, isQuestion, viewerId }: Props) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const { top, repliesByParent } = useMemo(() => {
    const replies = new Map<string, CommentData[]>();
    const roots: CommentData[] = [];
    for (const c of comments) {
      if (c.parentId) replies.set(c.parentId, [...(replies.get(c.parentId) ?? []), c]);
      else roots.push(c);
    }
    // La respuesta aceptada siempre va primero.
    roots.sort((a, b) => Number(b.isAccepted) - Number(a.isAccepted));
    return { top: roots, repliesByParent: replies };
  }, [comments]);

  const shared = { postId, postAuthorId, isQuestion, viewerId, replyingTo, setReplyingTo };

  return (
    <ul className="space-y-5">
      {top.map((c) => (
        <CommentItem key={c.id} comment={c} {...shared}>
          {(repliesByParent.get(c.id) ?? []).map((r) => (
            <CommentItem key={r.id} comment={r} isReply {...shared} />
          ))}
        </CommentItem>
      ))}
    </ul>
  );
}

type ItemProps = {
  comment: CommentData;
  isReply?: boolean;
  children?: React.ReactNode;
  postId: string;
  postAuthorId: string;
  isQuestion: boolean;
  viewerId: string | null;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
};

function CommentItem({
  comment: c,
  isReply,
  children,
  postId,
  postAuthorId,
  isQuestion,
  viewerId,
  replyingTo,
  setReplyingTo,
}: ItemProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isMine = viewerId === c.author.id;
  const canAccept = isQuestion && !isReply && viewerId === postAuthorId && !isMine;
  const canReply = !isReply;

  function run(fn: () => Promise<{ ok: boolean; error?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (res.ok) return;
      if (res.error === "auth") router.push(`/login?next=${encodeURIComponent(pathname)}`);
      else setError("No pudimos completar la acción. Inténtalo de nuevo.");
    });
  }

  const link = "font-medium text-muted hover:text-ink disabled:opacity-60";

  return (
    <li id={`c-${c.id}`} className="scroll-mt-20">
      <div className="flex gap-3">
        <Link href={`/u/${c.author.username}`} tabIndex={-1} aria-hidden>
          <Avatar name={c.author.displayName} src={c.author.avatarUrl} size={isReply ? "sm" : "md"} />
        </Link>
        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "rounded-2xl px-4 py-3",
              c.isAccepted ? "border border-helpful/40 bg-helpful-soft" : "bg-surface",
            )}
          >
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <Link href={`/u/${c.author.username}`} className="flex items-center gap-1 text-sm font-bold text-ink hover:underline">
                {c.author.displayName}
                {c.author.isVerified ? <VerifiedCheck /> : null}
              </Link>
              <LevelBadge reputation={c.author.reputation} />
              <span className="text-xs text-muted" suppressHydrationWarning>
                {timeAgo(c.createdAt)}
              </span>
            </div>
            {c.isAccepted ? (
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-helpful">
                <CircleCheck className="size-4" aria-hidden /> Respuesta aceptada
              </p>
            ) : null}
            <Markdown className="mt-1 space-y-2 text-sm">{c.body}</Markdown>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 px-2 text-[13px]">
            {canReply ? (
              <button
                type="button"
                className={link}
                onClick={() => {
                  if (!viewerId) router.push(`/login?next=${encodeURIComponent(pathname)}`);
                  else setReplyingTo(replyingTo === c.id ? null : c.id);
                }}
              >
                Responder
              </button>
            ) : null}
            {canAccept ? (
              <button
                type="button"
                disabled={pending}
                className={cn(link, c.isAccepted ? "" : "text-helpful hover:text-helpful")}
                onClick={() => run(() => toggleAcceptedAnswer(c.id))}
              >
                {c.isAccepted ? "Quitar aceptación" : "Aceptar respuesta"}
              </button>
            ) : null}
            {isMine ? (
              <button
                type="button"
                disabled={pending}
                className={link}
                onClick={() => {
                  if (window.confirm("¿Eliminar este comentario? Esta acción no se puede deshacer.")) {
                    run(() => deleteComment(c.id));
                  }
                }}
              >
                Eliminar
              </button>
            ) : null}
          </div>
          {error ? (
            <p role="alert" className="px-2 text-[13px] text-red-600">
              {error}
            </p>
          ) : null}

          {replyingTo === c.id ? (
            <div className="mt-2">
              <CommentForm
                postId={postId}
                parentId={c.id}
                label={`Responder a ${c.author.displayName}`}
                placeholder={`Responder a ${c.author.displayName}…`}
                submitLabel="Responder"
                autoFocus
                onDone={() => setReplyingTo(null)}
                onCancel={() => setReplyingTo(null)}
              />
            </div>
          ) : null}

          {children ? <ul className="mt-3 space-y-4">{children}</ul> : null}
        </div>
      </div>
    </li>
  );
}

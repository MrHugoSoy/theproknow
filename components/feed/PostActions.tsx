"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bookmark, Heart, MessageCircle, Share2, ThumbsUp } from "lucide-react";
import { setReaction, type ReactionKind } from "@/app/actions/reactions";
import { cn, formatNumber } from "@/lib/utils";

type Props = {
  postId: string;
  isQuestion: boolean;
  likeCount: number;
  commentCount: number;
  helpfulCount: number;
  initial?: { liked: boolean; helpful: boolean; saved: boolean };
};

const base =
  "inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm text-muted transition-colors hover:bg-surface";

export function PostActions({ postId, isQuestion, likeCount, commentCount, helpfulCount, initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();
  const [state, setState] = useState({
    like: initial?.liked ?? false,
    helpful: initial?.helpful ?? false,
    save: initial?.saved ?? false,
  });
  const [shared, setShared] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  function toggle(kind: ReactionKind) {
    const next = !state[kind];
    setState((s) => ({ ...s, [kind]: next }));
    setNotice(null);
    startTransition(async () => {
      const res = await setReaction(kind, postId, next);
      if (res.ok) return;
      setState((s) => ({ ...s, [kind]: !next })); // revertir
      if (res.error === "auth") router.push(`/login?next=${encodeURIComponent(pathname)}`);
      else if (res.error === "self") setNotice("No puedes reaccionar a tu propia publicación.");
      else setNotice("No pudimos guardar tu acción. Inténtalo de nuevo.");
    });
  }

  async function share() {
    const url = `${window.location.origin}/p/${postId}`;
    try {
      if (navigator.share) await navigator.share({ url });
      else await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    } catch {
      /* el usuario canceló */
    }
  }

  const likes = likeCount + (state.like !== (initial?.liked ?? false) ? (state.like ? 1 : -1) : 0);
  const helpfuls = helpfulCount + (state.helpful !== (initial?.helpful ?? false) ? (state.helpful ? 1 : -1) : 0);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
        <button
          type="button"
          aria-pressed={state.like}
          aria-label={state.like ? "Quitar me gusta" : "Me gusta"}
          onClick={() => toggle("like")}
          className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-like transition-colors hover:bg-red-50"
        >
          <Heart className={cn("size-5", state.like && "fill-like")} aria-hidden />
          {formatNumber(likes)}
        </button>

        <Link href={`/p/${postId}#comentarios`} aria-label={`${commentCount} comentarios`} className={base}>
          <MessageCircle className="size-5" aria-hidden />
          {formatNumber(commentCount)}
        </Link>

        <button type="button" onClick={share} className={base}>
          <Share2 className="size-5" aria-hidden />
          <span className="hidden sm:inline">{shared ? "¡Enlace copiado!" : "Compartir"}</span>
          <span className="sr-only sm:hidden">Compartir</span>
        </button>

        <button
          type="button"
          aria-pressed={state.save}
          onClick={() => toggle("save")}
          className={cn(base, state.save && "font-semibold text-brand")}
        >
          <Bookmark className={cn("size-5", state.save && "fill-brand")} aria-hidden />
          <span className="hidden sm:inline">{state.save ? "Guardado" : "Guardar"}</span>
          <span className="sr-only sm:hidden">{state.save ? "Guardado" : "Guardar"}</span>
        </button>

        {!isQuestion ? (
          <button
            type="button"
            aria-pressed={state.helpful}
            aria-label={`Me ayudó, ${helpfuls} personas`}
            onClick={() => toggle("helpful")}
            className={cn(
              "ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors sm:ml-1",
              state.helpful
                ? "border-helpful bg-helpful-soft text-helpful"
                : "border-line bg-white text-ink shadow-sm hover:bg-helpful-soft",
            )}
          >
            <ThumbsUp className={cn("size-4 text-helpful", state.helpful && "fill-helpful")} aria-hidden />
            Me ayudó
          </button>
        ) : null}
      </div>
      {notice ? (
        <p role="alert" className="mt-1 text-[13px] text-red-600">
          {notice}
        </p>
      ) : null}
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { Bookmark, Heart, MessageCircle, Share2, ThumbsUp } from "lucide-react";
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

// Fase 1: estado optimista local. En las fases 3–4 cada botón llama a su server action.
export function PostActions({ postId, isQuestion, likeCount, commentCount, helpfulCount, initial }: Props) {
  const [liked, setLiked] = useState(initial?.liked ?? false);
  const [helpful, setHelpful] = useState(initial?.helpful ?? false);
  const [saved, setSaved] = useState(initial?.saved ?? false);
  const [shared, setShared] = useState(false);

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

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-1">
      <button
        type="button"
        aria-pressed={liked}
        aria-label={liked ? "Quitar me gusta" : "Me gusta"}
        onClick={() => setLiked((v) => !v)}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-like transition-colors hover:bg-red-50"
      >
        <Heart className={cn("size-5", liked && "fill-like")} aria-hidden />
        {formatNumber(likeCount + (liked ? 1 : 0))}
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
        aria-pressed={saved}
        onClick={() => setSaved((v) => !v)}
        className={cn(base, saved && "font-semibold text-brand")}
      >
        <Bookmark className={cn("size-5", saved && "fill-brand")} aria-hidden />
        <span className="hidden sm:inline">{saved ? "Guardado" : "Guardar"}</span>
        <span className="sr-only sm:hidden">{saved ? "Guardado" : "Guardar"}</span>
      </button>

      {!isQuestion ? (
        <button
          type="button"
          aria-pressed={helpful}
          aria-label={`Me ayudó, ${helpfulCount + (helpful ? 1 : 0)} personas`}
          onClick={() => setHelpful((v) => !v)}
          className={cn(
            "ml-auto inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-semibold transition-colors sm:ml-1",
            helpful
              ? "border-helpful bg-helpful-soft text-helpful"
              : "border-line bg-white text-ink shadow-sm hover:bg-helpful-soft",
          )}
        >
          <ThumbsUp className={cn("size-4 text-helpful", helpful && "fill-helpful")} aria-hidden />
          Me ayudó
        </button>
      ) : null}
    </div>
  );
}

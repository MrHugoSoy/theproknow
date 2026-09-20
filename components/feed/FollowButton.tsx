"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  username: string;
  initialFollowing?: boolean;
  variant?: "outline" | "solid";
  className?: string;
};

// Fase 1: solo estado local. En la Fase 5 se conecta a la server action `toggleFollow`.
export function FollowButton({ username, initialFollowing = false, variant = "outline", className }: Props) {
  const [following, setFollowing] = useState(initialFollowing);
  return (
    <button
      type="button"
      aria-pressed={following}
      aria-label={following ? `Dejar de seguir a @${username}` : `Seguir a @${username}`}
      onClick={() => setFollowing((v) => !v)}
      className={cn(
        "h-8 rounded-lg border px-3.5 text-[13px] font-semibold transition-colors",
        following
          ? "border-line bg-surface text-muted hover:bg-white"
          : variant === "outline"
            ? "border-brand/40 text-brand hover:bg-brand-soft"
            : "border-line bg-white text-ink shadow-sm hover:bg-surface",
        className,
      )}
    >
      {following ? "Siguiendo" : "Seguir"}
    </button>
  );
}

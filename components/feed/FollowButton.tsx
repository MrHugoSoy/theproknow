"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { setFollow } from "@/app/actions/follow";
import { cn } from "@/lib/utils";

type Props = {
  username: string;
  initialFollowing?: boolean;
  variant?: "outline" | "solid";
  className?: string;
};

export function FollowButton({ username, initialFollowing = false, variant = "outline", className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !following;
    setFollowing(next);
    startTransition(async () => {
      const res = await setFollow(username, next);
      if (res.ok) return;
      setFollowing(!next);
      if (res.error === "auth") router.push(`/login?next=${encodeURIComponent(pathname)}`);
    });
  }

  return (
    <button
      type="button"
      aria-pressed={following}
      aria-label={following ? `Dejar de seguir a @${username}` : `Seguir a @${username}`}
      disabled={pending}
      onClick={toggle}
      className={cn(
        "h-8 rounded-lg border px-3.5 text-[13px] font-semibold transition-colors disabled:opacity-70",
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

"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { setMembership } from "@/app/actions/community";
import { Button } from "@/components/ui/Button";

type Props = { communityId: string; initialJoined: boolean; className?: string };

export function JoinButton({ communityId, initialJoined, className }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [joined, setJoined] = useState(initialJoined);
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = !joined;
    setJoined(next);
    startTransition(async () => {
      const res = await setMembership(communityId, next);
      if (res.ok) {
        router.refresh(); // actualiza el conteo de miembros
        return;
      }
      setJoined(!next);
      if (res.error === "auth") router.push(`/login?next=${encodeURIComponent(pathname)}`);
    });
  }

  return (
    <Button
      variant={joined ? "secondary" : "primary"}
      size="sm"
      aria-pressed={joined}
      disabled={pending}
      onClick={toggle}
      className={className}
    >
      {joined ? "Ya eres miembro" : "Unirme"}
    </Button>
  );
}

"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings, User } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { Avatar } from "@/components/ui/Avatar";

type Props = { displayName: string; username: string; avatarUrl: string | null };

export function AccountMenu({ displayName, username, avatarUrl }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = "flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm text-ink hover:bg-surface";

  return (
    <div ref={ref} className="relative hidden sm:block">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-white/10"
      >
        <Avatar name={displayName} src={avatarUrl} size="sm" />
        <span className="text-sm font-medium">{displayName.split(" ")[0]}</span>
        <ChevronDown className="size-4 text-slate-300" aria-hidden />
        <span className="sr-only">Menú de cuenta</span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-line bg-white p-1.5 text-ink shadow-lg"
        >
          <p className="truncate px-3 py-2 text-xs text-muted">@{username}</p>
          <Link role="menuitem" href={`/u/${username}`} onClick={() => setOpen(false)} className={item}>
            <User className="size-4 text-muted" aria-hidden /> Mi perfil
          </Link>
          <Link role="menuitem" href="/ajustes" onClick={() => setOpen(false)} className={item}>
            <Settings className="size-4 text-muted" aria-hidden /> Ajustes
          </Link>
          <form action={signOut}>
            <button role="menuitem" type="submit" className={item}>
              <LogOut className="size-4 text-muted" aria-hidden /> Cerrar sesión
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Ellipsis, Flag, Link2, Pencil, Trash2 } from "lucide-react";
import { deletePost } from "@/app/actions/posts";
import { ReportDialog } from "./ReportDialog";

type Props = {
  postId: string;
  /** el usuario actual es el autor: se ofrece Editar/Eliminar en lugar de Reportar */
  isOwner?: boolean;
  /** se llama tras eliminar (para quitar la tarjeta de una lista sin recargar) */
  onDeleted?: (postId: string) => void;
};

/** Menú "⋯" de una publicación: copiar enlace, reportar y, si es tuya, editar o eliminar. */
export function PostMenu({ postId, isOwner = false, onDeleted }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/p/${postId}`);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 1200);
    } catch {
      setOpen(false);
    }
  }

  function remove() {
    if (!window.confirm("¿Eliminar esta publicación? Se borrarán también sus comentarios y reacciones. No se puede deshacer.")) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await deletePost(postId);
      if (!res.ok) {
        if (res.error === "auth") router.push(`/login?next=${encodeURIComponent(pathname)}`);
        else setError("No pudimos eliminar la publicación. Inténtalo de nuevo.");
        return;
      }
      setOpen(false);
      if (pathname.startsWith(`/p/${postId}`)) router.push("/");
      else {
        onDeleted?.(postId);
        router.refresh();
      }
    });
  }

  const item = "flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm text-ink hover:bg-surface disabled:opacity-60";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Más opciones"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-surface"
      >
        <Ellipsis className="size-5" aria-hidden />
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border border-line bg-white p-1.5 shadow-lg">
          <button role="menuitem" type="button" className={item} onClick={copy}>
            <Link2 className="size-4 text-muted" aria-hidden /> {copied ? "¡Enlace copiado!" : "Copiar enlace"}
          </button>
          {isOwner ? (
            <>
              <Link role="menuitem" href={`/p/${postId}/editar`} className={item} onClick={() => setOpen(false)}>
                <Pencil className="size-4 text-muted" aria-hidden /> Editar publicación
              </Link>
              <button role="menuitem" type="button" className={`${item} text-red-700`} onClick={remove} disabled={pending}>
                <Trash2 className="size-4" aria-hidden /> {pending ? "Eliminando…" : "Eliminar publicación"}
              </button>
            </>
          ) : (
            <button
              role="menuitem"
              type="button"
              className={item}
              onClick={() => {
                setOpen(false);
                setReporting(true);
              }}
            >
              <Flag className="size-4 text-muted" aria-hidden /> Reportar publicación
            </button>
          )}
          {error ? (
            <p role="alert" className="px-3 py-1 text-[13px] text-red-600">
              {error}
            </p>
          ) : null}
        </div>
      ) : null}
      {isOwner ? null : <ReportDialog target={{ postId }} open={reporting} onClose={() => setReporting(false)} />}
    </div>
  );
}

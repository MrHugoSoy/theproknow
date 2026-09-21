"use client";

import { useEffect, useRef, useState } from "react";
import { Ellipsis, Flag, Link2 } from "lucide-react";
import { ReportDialog } from "./ReportDialog";

/** Menú "⋯" de una publicación: copiar enlace y reportar. */
export function PostMenu({ postId }: { postId: string }) {
  const [open, setOpen] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [copied, setCopied] = useState(false);
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

  const item = "flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm text-ink hover:bg-surface";

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
        <div role="menu" className="absolute right-0 top-full z-20 mt-1 w-52 rounded-xl border border-line bg-white p-1.5 shadow-lg">
          <button role="menuitem" type="button" className={item} onClick={copy}>
            <Link2 className="size-4 text-muted" aria-hidden /> {copied ? "¡Enlace copiado!" : "Copiar enlace"}
          </button>
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
        </div>
      ) : null}
      <ReportDialog target={{ postId }} open={reporting} onClose={() => setReporting(false)} />
    </div>
  );
}

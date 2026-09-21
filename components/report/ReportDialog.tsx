"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { reportContent } from "@/app/actions/reports";
import { Button } from "@/components/ui/Button";
import { REPORT_REASONS, type ReportReason } from "@/lib/validation/report";

type Props = {
  target: { postId?: string; commentId?: string };
  open: boolean;
  onClose: () => void;
};

/** Diálogo modal nativo (<dialog>): trampa de foco y cierre con Escape sin código extra. */
export function ReportDialog({ target, open, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const uid = useId(); // ids únicos: hay un diálogo por tarjeta en la misma página
  const titleId = `${uid}-title`;
  const detailsId = `${uid}-details`;
  const router = useRouter();
  const pathname = usePathname();
  const [reason, setReason] = useState<ReportReason>("spam");
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<{ kind: "idle" | "sent" | "error"; text?: string }>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
    if (open) setStatus({ kind: "idle" });
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await reportContent({ ...target, reason, details: details.trim() || undefined });
      if (res.ok) {
        setStatus({ kind: "sent", text: "Gracias por avisarnos. Revisaremos este contenido." });
        setDetails("");
      } else if (res.error === "auth") router.push(`/login?next=${encodeURIComponent(pathname)}`);
      else if (res.error === "duplicate") setStatus({ kind: "sent", text: "Ya habías reportado este contenido. Gracias." });
      else setStatus({ kind: "error", text: "No pudimos enviar el reporte. Inténtalo de nuevo." });
    });
  }

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby={titleId}
      className="m-auto w-[min(92vw,26rem)] rounded-card border border-line bg-white p-0 text-ink shadow-xl backdrop:bg-navy/50"
    >
      <form onSubmit={submit} className="space-y-4 p-5">
        <h2 id={titleId} className="text-lg font-bold">
          Reportar contenido
        </h2>

        {status.kind === "sent" ? (
          <>
            <p role="status" className="rounded-lg bg-helpful-soft px-3 py-2 text-sm text-helpful">
              {status.text}
            </p>
            <div className="flex justify-end">
              <Button onClick={onClose}>Cerrar</Button>
            </div>
          </>
        ) : (
          <>
            <fieldset className="space-y-1.5">
              <legend className="mb-1 text-sm font-semibold">¿Cuál es el problema?</legend>
              {(Object.keys(REPORT_REASONS) as ReportReason[]).map((key) => (
                <label key={key} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-surface">
                  <input
                    type="radio"
                    name="reason"
                    value={key}
                    checked={reason === key}
                    onChange={() => setReason(key)}
                    className="size-4 accent-brand"
                  />
                  {REPORT_REASONS[key]}
                </label>
              ))}
            </fieldset>
            <div>
              <label htmlFor={detailsId} className="mb-1 block text-sm font-semibold">
                Detalles (opcional)
              </label>
              <textarea
                id={detailsId}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                maxLength={400}
                rows={3}
                className="w-full rounded-xl border border-line p-3 text-sm"
              />
            </div>
            {status.kind === "error" ? (
              <p role="alert" className="text-[13px] text-red-600">
                {status.text}
              </p>
            ) : null}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? "Enviando…" : "Enviar reporte"}
              </Button>
            </div>
          </>
        )}
      </form>
    </dialog>
  );
}

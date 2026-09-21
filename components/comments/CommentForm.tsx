"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { addComment } from "@/app/actions/comments";
import { Button } from "@/components/ui/Button";
import type { CommentFormState } from "@/lib/validation/comment";

type Props = {
  postId: string;
  parentId?: string;
  label: string;
  placeholder: string;
  submitLabel?: string;
  autoFocus?: boolean;
  onDone?: () => void;
  onCancel?: () => void;
};

export function CommentForm({
  postId,
  parentId,
  label,
  placeholder,
  submitLabel = "Comentar",
  autoFocus,
  onDone,
  onCancel,
}: Props) {
  const [state, action, pending] = useActionState<CommentFormState, FormData>(addComment, {});
  const [body, setBody] = useState("");
  const handled = useRef<number | undefined>(undefined);
  const id = `comment-${parentId ?? "root"}`;

  // Al publicarse bien: limpiar el campo (y cerrar el formulario de respuesta).
  useEffect(() => {
    if (state.ok && state.nonce !== handled.current) {
      handled.current = state.nonce;
      setBody("");
      onDone?.();
    }
  }, [state, onDone]);

  const error = state.errors?.body?.[0] ?? state.message;

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="postId" value={postId} />
      {parentId ? <input type="hidden" name="parentId" value={parentId} /> : null}
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <textarea
        id={id}
        name="body"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={parentId ? 2 : 3}
        maxLength={5000}
        autoFocus={autoFocus}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className="w-full rounded-xl border border-line bg-white p-3 text-sm text-ink placeholder:text-slate-400"
      />
      {error ? (
        <p role="alert" className="text-[13px] text-red-600">
          {error}
        </p>
      ) : null}
      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" size="sm" disabled={pending || body.trim().length === 0}>
          {pending ? "Enviando…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";
import { MailCheck } from "lucide-react";
import { requestPasswordReset } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { recoverSchema, type AuthState, type FieldErrors } from "@/lib/validation/auth";

export function RecoverForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(requestPasswordReset, {});
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const errors = { ...state.errors, ...clientErrors };

  if (state.ok) {
    return (
      <div role="status" className="rounded-xl bg-brand-soft p-5 text-center">
        <MailCheck className="mx-auto size-8 text-brand" aria-hidden />
        <h2 className="mt-2 font-bold text-ink">Revisa tu correo</h2>
        <p className="mt-1 text-sm text-muted">{state.message}</p>
        <p className="mt-2 text-xs text-muted">Si no lo ves, revisa la carpeta de spam. El enlace caduca en poco tiempo.</p>
      </div>
    );
  }

  return (
    <form
      action={action}
      noValidate
      onSubmit={(e) => {
        const r = recoverSchema.safeParse({ email: new FormData(e.currentTarget).get("email") });
        if (!r.success) {
          e.preventDefault();
          setClientErrors(r.error.flatten().fieldErrors);
        } else setClientErrors({});
      }}
      className="space-y-4"
    >
      <TextField label="Correo electrónico" name="email" type="email" autoComplete="email" error={errors.email?.[0]} />
      {state.message ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Enviando…" : "Enviar enlace"}
      </Button>
    </form>
  );
}

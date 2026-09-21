"use client";

import { useActionState, useState } from "react";
import { updatePassword } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { resetSchema, type AuthState, type FieldErrors } from "@/lib/validation/auth";

export function ResetForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(updatePassword, {});
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const errors = { ...state.errors, ...clientErrors };

  return (
    <form
      action={action}
      noValidate
      onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);
        const r = resetSchema.safeParse({ password: fd.get("password"), confirm: fd.get("confirm") });
        if (!r.success) {
          e.preventDefault();
          setClientErrors(r.error.flatten().fieldErrors);
        } else setClientErrors({});
      }}
      className="space-y-4"
    >
      <TextField
        label="Contraseña nueva"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="Mínimo 8 caracteres, con letras y números."
        error={errors.password?.[0]}
      />
      <TextField
        label="Repite la contraseña"
        name="confirm"
        type="password"
        autoComplete="new-password"
        error={errors.confirm?.[0]}
      />
      {state.message ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";
import { MailCheck } from "lucide-react";
import { signUp } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { registerSchema, type AuthState, type FieldErrors } from "@/lib/validation/auth";

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(signUp, {});
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const errors = { ...state.errors, ...clientErrors };

  if (state.needsConfirmation) {
    return (
      <div role="status" className="rounded-xl bg-brand-soft p-5 text-center">
        <MailCheck className="mx-auto size-8 text-brand" aria-hidden />
        <h2 className="mt-2 font-bold text-ink">Revisa tu correo</h2>
        <p className="mt-1 text-sm text-muted">
          Enviamos un enlace de confirmación a <strong className="text-ink">{state.message}</strong>. Ábrelo para
          activar tu cuenta.
        </p>
      </div>
    );
  }

  return (
    <form
      action={action}
      noValidate
      onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);
        const r = registerSchema.safeParse(Object.fromEntries(fd));
        if (!r.success) {
          e.preventDefault();
          setClientErrors(r.error.flatten().fieldErrors);
        } else setClientErrors({});
      }}
      className="space-y-4"
    >
      <TextField label="Nombre" name="displayName" autoComplete="name" error={errors.displayName?.[0]} />
      <TextField
        label="Nombre de usuario"
        name="username"
        autoComplete="username"
        autoCapitalize="none"
        placeholder="tu.usuario"
        error={errors.username?.[0]}
      />
      <TextField label="Correo electrónico" name="email" type="email" autoComplete="email" error={errors.email?.[0]} />
      <TextField
        label="Contraseña"
        name="password"
        type="password"
        autoComplete="new-password"
        hint="Mínimo 8 caracteres, con letras y números."
        error={errors.password?.[0]}
      />
      {state.message ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
    </form>
  );
}

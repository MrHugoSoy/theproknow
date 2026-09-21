"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { signIn } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { loginSchema, type AuthState, type FieldErrors } from "@/lib/validation/auth";
import { ResendConfirmation } from "./ResendConfirmation";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(signIn, {});
  const [clientErrors, setClientErrors] = useState<FieldErrors>({});
  const errors = { ...state.errors, ...clientErrors };

  return (
    <form
      action={action}
      noValidate
      onSubmit={(e) => {
        const fd = new FormData(e.currentTarget);
        const r = loginSchema.safeParse({ email: fd.get("email"), password: fd.get("password") });
        if (!r.success) {
          e.preventDefault();
          setClientErrors(r.error.flatten().fieldErrors);
        } else setClientErrors({});
      }}
      className="space-y-4"
    >
      <input type="hidden" name="next" value={next ?? "/"} />
      <TextField label="Correo electrónico" name="email" type="email" autoComplete="email" error={errors.email?.[0]} />
      <div>
        <TextField label="Contraseña" name="password" type="password" autoComplete="current-password" error={errors.password?.[0]} />
        <p className="mt-1.5 text-right text-[13px]">
          <Link href="/recuperar" className="font-medium text-brand hover:underline">
            ¿Olvidaste tu contraseña?
          </Link>
        </p>
      </div>
      {state.message ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Entrando…" : "Iniciar sesión"}
      </Button>
      {state.unconfirmedEmail ? <ResendConfirmation email={state.unconfirmedEmail} /> : null}
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { resendConfirmation } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/Button";
import type { AuthState } from "@/lib/validation/auth";

/** Aparece cuando el inicio de sesión falla por correo sin confirmar. */
export function ResendConfirmation({ email }: { email: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(resendConfirmation, {});

  if (state.ok) {
    return (
      <p role="status" className="rounded-lg bg-helpful-soft px-3 py-2 text-sm text-helpful">
        {state.message}
      </p>
    );
  }
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="email" value={email} />
      {state.message ? (
        <p role="alert" className="text-[13px] text-red-600">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Enviando…" : "Reenviar correo de confirmación"}
      </Button>
    </form>
  );
}

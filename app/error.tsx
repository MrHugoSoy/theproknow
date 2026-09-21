"use client";

import { ErrorView } from "@/components/layout/ErrorView";

/** Error fuera del layout principal (p. ej. login o registro). */
export default function RootError(props: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="w-full">
        <ErrorView {...props} />
      </div>
    </main>
  );
}

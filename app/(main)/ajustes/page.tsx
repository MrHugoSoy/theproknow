import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogOut } from "lucide-react";
import { signOut } from "@/app/(auth)/actions";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getViewer } from "@/lib/data/viewer";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Ajustes" };

export default async function SettingsPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/ajustes");

  let email = "";
  let bio = "";
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const [{ data: auth }, { data: profile }] = await Promise.all([
      supabase.auth.getUser(),
      supabase.from("profiles").select("bio").eq("id", viewer.id).single(),
    ]);
    email = auth.user?.email ?? "";
    bio = profile?.bio ?? "";
  }

  return (
    <div className="space-y-4">
      <h1 className="px-1 text-xl font-extrabold text-ink">Ajustes</h1>

      <Card className="p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-bold text-ink">Tu perfil</h2>
        <SettingsForm
          userId={viewer.id}
          initial={{
            displayName: viewer.displayName,
            username: viewer.username,
            bio,
            avatarUrl: viewer.avatarUrl ?? "",
          }}
        />
      </Card>

      <Card className="p-5 sm:p-6">
        <h2 className="mb-1 text-lg font-bold text-ink">Cuenta</h2>
        {email ? (
          <p className="text-sm text-muted">
            Sesión iniciada como <strong className="text-ink">{email}</strong>
          </p>
        ) : null}
        <form action={signOut} className="mt-4">
          <Button type="submit" variant="secondary">
            <LogOut className="size-4" aria-hidden /> Cerrar sesión
          </Button>
        </form>
      </Card>
    </div>
  );
}

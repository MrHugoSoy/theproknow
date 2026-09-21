"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./reactions";

const schema = z.object({ communityId: z.string().uuid(), active: z.boolean() });

/** Unirse o salir de una comunidad (estado deseado, idempotente). Solo comunidades activas. */
export async function setMembership(communityId: string, active: boolean): Promise<ActionResult> {
  const parsed = schema.safeParse({ communityId, active });
  if (!parsed.success) return { ok: false, error: "unknown" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const row = { user_id: user.id, community_id: communityId };
  const { error } = active
    ? await supabase.from("community_members").insert(row)
    : await supabase.from("community_members").delete().match(row);

  if (error && error.code !== "23505") {
    if (error.code === "42501") return { ok: false, error: "forbidden" }; // comunidad no activa
    console.error("setMembership:", error);
    return { ok: false, error: "unknown" };
  }
  // Cambia el feed "Siguiendo/Para ti" y los conteos de miembros.
  revalidatePath("/", "layout");
  return { ok: true };
}

"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./reactions";

const schema = z.object({
  username: z.string().regex(/^[a-z0-9_.]{3,30}$/),
  active: z.boolean(),
});

/** Seguir / dejar de seguir a un usuario por su @username (estado deseado, idempotente). */
export async function setFollow(username: string, active: boolean): Promise<ActionResult> {
  const parsed = schema.safeParse({ username, active });
  if (!parsed.success) return { ok: false, error: "unknown" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const { data: target } = await supabase.from("profiles").select("id").eq("username", parsed.data.username).maybeSingle();
  if (!target) return { ok: false, error: "unknown" };
  if (target.id === user.id) return { ok: false, error: "self" };

  const row = { follower_id: user.id, following_id: target.id };
  const { error } = active
    ? await supabase.from("follows").insert(row)
    : await supabase.from("follows").delete().match(row);

  if (!error || error.code === "23505") return { ok: true };
  console.error("setFollow:", error);
  return { ok: false, error: "unknown" };
}

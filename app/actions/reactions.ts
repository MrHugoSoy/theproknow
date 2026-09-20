"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type ReactionKind = "like" | "helpful" | "save";
export type ActionResult = { ok: true } | { ok: false; error: "auth" | "self" | "unknown" };

const schema = z.object({
  kind: z.enum(["like", "helpful", "save"]),
  postId: z.string().uuid(),
  active: z.boolean(),
});

/**
 * Fija el estado de una reacción (idempotente: recibe el estado deseado, no "alternar").
 * Los contadores y la reputación los mantienen los triggers de la base de datos.
 */
export async function setReaction(kind: ReactionKind, postId: string, active: boolean): Promise<ActionResult> {
  const parsed = schema.safeParse({ kind, postId, active });
  if (!parsed.success) return { ok: false, error: "unknown" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const row = { user_id: user.id, post_id: postId };
  let error: { code?: string } | null = null;

  if (kind === "like") {
    error = active
      ? (await supabase.from("likes").insert(row)).error
      : (await supabase.from("likes").delete().match(row)).error;
  } else if (kind === "helpful") {
    error = active
      ? (await supabase.from("helpful_marks").insert(row)).error
      : (await supabase.from("helpful_marks").delete().match(row)).error;
  } else {
    error = active
      ? (await supabase.from("saves").insert(row)).error
      : (await supabase.from("saves").delete().match(row)).error;
  }

  if (!error || error.code === "23505") return { ok: true }; // ya existía: idempotente
  if (error.code === "42501") return { ok: false, error: "self" };
  console.error("setReaction:", error);
  return { ok: false, error: "unknown" };
}

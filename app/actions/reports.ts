"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { stripControlChars } from "@/lib/text";
import { REPORT_REASONS, type ReportReason } from "@/lib/validation/report";

export type ReportResult = { ok: true } | { ok: false; error: "auth" | "duplicate" | "invalid" | "unknown" };

const schema = z
  .object({
    postId: z.string().uuid().optional(),
    commentId: z.string().uuid().optional(),
    reason: z.enum(["spam", "ofensivo", "falso", "otro"]),
    details: z.string().max(400).optional(),
  })
  .refine((v) => Boolean(v.postId) !== Boolean(v.commentId), "Indica una publicación o un comentario");

/** Reporta una publicación o un comentario. 5 reportes distintos ocultan el post automáticamente. */
export async function reportContent(input: {
  postId?: string;
  commentId?: string;
  reason: ReportReason;
  details?: string;
}): Promise<ReportResult> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const v = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const details = v.details ? stripControlChars(v.details).trim() : "";
  const reason = details ? `${REPORT_REASONS[v.reason]}: ${details}` : REPORT_REASONS[v.reason];

  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    post_id: v.postId ?? null,
    comment_id: v.commentId ?? null,
    reason,
  });
  if (error) {
    if (error.code === "23505") return { ok: false, error: "duplicate" };
    console.error("reportContent:", error);
    return { ok: false, error: "unknown" };
  }
  return { ok: true };
}

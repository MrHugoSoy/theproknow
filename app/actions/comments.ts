"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { commentSchema, type CommentFormState } from "@/lib/validation/comment";
import type { ActionResult } from "./reactions";

const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");

export async function addComment(_prev: CommentFormState, formData: FormData): Promise<CommentFormState> {
  const parsed = commentSchema.safeParse({
    postId: str(formData, "postId"),
    parentId: str(formData, "parentId"),
    body: str(formData, "body"),
  });
  if (!parsed.success) return { errors: parsed.error.flatten().fieldErrors };
  const v = parsed.data;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { message: "Inicia sesión para comentar." };

  const { error } = await supabase.from("comments").insert({
    post_id: v.postId,
    author_id: user.id,
    parent_id: v.parentId,
    body: v.body,
  });

  if (error) {
    if (error.message.includes("rate_limit")) {
      return { message: "Estás comentando muy rápido. Espera unos minutos e inténtalo de nuevo." };
    }
    if (error.code === "23514") return { message: "Solo se puede responder a un comentario principal." };
    if (error.code === "42501") return { message: "No puedes comentar en esta publicación." };
    console.error("addComment:", error);
    return { message: "No pudimos publicar tu comentario. Inténtalo de nuevo." };
  }

  revalidatePath(`/p/${v.postId}`);
  return { ok: true, nonce: Date.now() };
}

const idSchema = z.string().uuid();

/** Elimina un comentario propio (y sus respuestas, por cascada). */
export async function deleteComment(commentId: string): Promise<ActionResult> {
  if (!idSchema.safeParse(commentId).success) return { ok: false, error: "unknown" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const { data: row } = await supabase.from("comments").select("post_id").eq("id", commentId).maybeSingle();
  const { error } = await supabase.from("comments").delete().match({ id: commentId, author_id: user.id });
  if (error) {
    console.error("deleteComment:", error);
    return { ok: false, error: "unknown" };
  }
  if (row) revalidatePath(`/p/${row.post_id}`);
  return { ok: true };
}

/** El autor de una pregunta acepta (o quita) una respuesta. */
export async function toggleAcceptedAnswer(commentId: string): Promise<ActionResult> {
  if (!idSchema.safeParse(commentId).success) return { ok: false, error: "unknown" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "auth" };

  const { data: row } = await supabase.from("comments").select("post_id").eq("id", commentId).maybeSingle();
  const { error } = await supabase.rpc("toggle_accepted_answer", { p_comment_id: commentId });
  if (error) {
    if (error.code === "42501") return { ok: false, error: "self" };
    console.error("toggleAcceptedAnswer:", error);
    return { ok: false, error: "unknown" };
  }
  if (row) revalidatePath(`/p/${row.post_id}`);
  return { ok: true };
}

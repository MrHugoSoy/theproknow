import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { PostForm } from "@/components/feed/PostForm";
import { Card } from "@/components/ui/Card";
import { getViewer } from "@/lib/data/viewer";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Editar publicación", robots: { index: false, follow: false } };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseConfigured() || !z.string().uuid().safeParse(id).success) notFound();

  const viewer = await getViewer();
  if (!viewer) redirect(`/login?next=/p/${id}/editar`);

  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("id, author_id, type, title, body, cover_url, video_url, community:communities!posts_community_id_fkey(name)")
    .eq("id", id)
    .maybeSingle();
  if (!post) notFound();
  // Solo el autor edita (la base de datos también lo exige con RLS).
  if (post.author_id !== viewer.id) redirect(`/p/${id}`);

  return (
    <Card className="p-5 sm:p-6">
      <Link href={`/p/${post.id}`} className="text-[13px] font-medium text-brand hover:underline">
        ← Volver a la publicación
      </Link>
      <h1 className="mt-2 text-xl font-extrabold text-ink">Editar publicación</h1>
      <div className="mt-6">
        <PostForm
          userId={viewer.id}
          communities={[]}
          edit={{
            postId: post.id,
            type: post.type,
            communityName: post.community.name,
            title: post.title,
            body: post.body,
            coverUrl: post.cover_url ?? "",
            videoUrl: post.video_url ?? "",
          }}
        />
      </div>
    </Card>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { FeedList } from "@/components/feed/FeedList";
import { buttonStyles } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchFeed } from "@/lib/data/feed";
import { getViewer } from "@/lib/data/viewer";

export const metadata: Metadata = { title: "Guardados", robots: { index: false, follow: false } };

export default async function SavedPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/guardados");

  const { posts, nextCursor } = await fetchFeed({ tab: "guardados" });

  return (
    <div className="space-y-4">
      <h1 className="px-1 text-xl font-extrabold text-ink">Guardados</h1>
      {posts.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Aún no has guardado nada"
          description="Toca «Guardar» en una publicación para encontrarla fácilmente cuando la necesites."
          action={
            <Link href="/explorar" className={buttonStyles("primary")}>
              Explorar publicaciones
            </Link>
          }
        />
      ) : (
        <FeedList initialPosts={posts} initialCursor={nextCursor} tab="guardados" viewerId={viewer.id} />
      )}
    </div>
  );
}

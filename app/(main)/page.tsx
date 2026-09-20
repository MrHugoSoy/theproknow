import Link from "next/link";
import { Users } from "lucide-react";
import { Composer } from "@/components/feed/Composer";
import { FeedTabs, parseTab } from "@/components/feed/FeedTabs";
import { PostCard } from "@/components/feed/PostCard";
import { buttonStyles } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { getMockPosts, MOCK_ME } from "@/lib/mock";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const tab = parseTab((await searchParams).tab);
  const posts = getMockPosts();
  // Fase 1: datos mock. "Siguiendo" muestra el estado vacío para validar el copy.
  const visible = tab === "siguiendo" ? [] : tab === "tendencias" ? [...posts].reverse() : posts;

  return (
    <div className="space-y-4">
      <Composer displayName={MOCK_ME.displayName} avatarUrl={MOCK_ME.avatarUrl} />
      <FeedTabs active={tab} />
      <h1 className="sr-only">Inicio</h1>
      {visible.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aún no sigues a nadie"
          description="Sigue a expertos o únete a una comunidad y sus publicaciones aparecerán aquí."
          action={
            <Link href="/explorar" className={buttonStyles("primary")}>
              Explorar comunidades
            </Link>
          }
        />
      ) : (
        visible.map((p) => <PostCard key={p.id} post={p} />)
      )}
    </div>
  );
}

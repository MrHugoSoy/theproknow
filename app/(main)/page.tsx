import Link from "next/link";
import { Users } from "lucide-react";
import { Composer } from "@/components/feed/Composer";
import { FeedTabs, parseTab } from "@/components/feed/FeedTabs";
import { PostCard } from "@/components/feed/PostCard";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getViewer } from "@/lib/data/viewer";
import { getMockPosts } from "@/lib/mock";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ tab: rawTab }, viewer] = await Promise.all([searchParams, getViewer()]);
  const tab = parseTab(rawTab);
  const posts = getMockPosts();
  // Los posts siguen siendo mock hasta la Fase 3. "Siguiendo" muestra el estado vacío.
  const visible = tab === "siguiendo" ? [] : tab === "tendencias" ? [...posts].reverse() : posts;

  return (
    <div className="space-y-4">
      {viewer ? (
        <Composer displayName={viewer.displayName} avatarUrl={viewer.avatarUrl} />
      ) : (
        <Card className="flex flex-col items-start gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-ink">Aprende de quienes saben</h2>
            <p className="text-sm text-muted">Crea una cuenta para publicar, guardar y seguir a expertos.</p>
          </div>
          <Link href="/registro" className={buttonStyles("primary")}>
            Crear cuenta
          </Link>
        </Card>
      )}
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

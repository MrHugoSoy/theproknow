import Link from "next/link";
import { Lightbulb, LogIn, Users } from "lucide-react";
import { Composer } from "@/components/feed/Composer";
import { FeedList } from "@/components/feed/FeedList";
import { FeedTabs, parseTab } from "@/components/feed/FeedTabs";
import { buttonStyles } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { fetchFeed } from "@/lib/data/feed";
import { getViewer } from "@/lib/data/viewer";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [{ tab: rawTab }, viewer] = await Promise.all([searchParams, getViewer()]);
  const tab = parseTab(rawTab);
  const { posts, nextCursor } = await fetchFeed({ tab });

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
      {posts.length === 0 ? (
        tab === "siguiendo" ? (
          viewer ? (
            <EmptyState
              icon={Users}
              title="Aún no hay nada en tu feed"
              description="Sigue a expertos o únete a una comunidad y sus publicaciones aparecerán aquí."
              action={
                <Link href="/explorar" className={buttonStyles("primary")}>
                  Explorar comunidades
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon={LogIn}
              title="Inicia sesión para ver a quienes sigues"
              description="Tu feed «Siguiendo» reúne lo que publican tus expertos y comunidades favoritas."
              action={
                <Link href="/login?next=/%3Ftab%3Dsiguiendo" className={buttonStyles("primary")}>
                  Iniciar sesión
                </Link>
              }
            />
          )
        ) : (
          <EmptyState
            icon={Lightbulb}
            title="Todavía no hay publicaciones"
            description="Sé la primera persona en compartir un consejo, una pregunta o un tutorial."
            action={
              <Link href="/publicar" className={buttonStyles("primary")}>
                Publicar ahora
              </Link>
            }
          />
        )
      ) : (
        // key: al cambiar de pestaña se reinicia el estado de la lista
        <FeedList key={tab} initialPosts={posts} initialCursor={nextCursor} tab={tab} viewerId={viewer?.id} />
      )}
    </div>
  );
}

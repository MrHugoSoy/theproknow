import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { MarkRead } from "@/components/notifications/MarkRead";
import { Avatar } from "@/components/ui/Avatar";
import { VerifiedCheck } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getNotifications, type NotificationItem } from "@/lib/data/notifications";
import { getViewer } from "@/lib/data/viewer";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { cn, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Notificaciones", robots: { index: false, follow: false } };

const TEXT: Record<NotificationItem["type"], string> = {
  like: "le dio me gusta a tu publicación",
  helpful: "marcó como útil tu publicación",
  comment: "comentó en tu publicación",
  reply: "respondió a tu comentario en",
  accepted: "aceptó tu respuesta en",
  follow: "empezó a seguirte",
};

function hrefFor(n: NotificationItem): string {
  if (n.type === "follow") return `/u/${n.actor.username}`;
  if (!n.postId) return "/";
  return n.commentId ? `/p/${n.postId}#c-${n.commentId}` : `/p/${n.postId}`;
}

export default async function NotificationsPage() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login?next=/notificaciones");
  if (!isSupabaseConfigured()) {
    return <EmptyState icon={Bell} title="Sin conexión a Supabase" description="Las notificaciones requieren la base de datos configurada." />;
  }

  const items = await getNotifications(viewer.id);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="space-y-4">
      <h1 className="px-1 text-xl font-extrabold text-ink">Notificaciones</h1>
      <MarkRead unread={unread} />
      {items.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="Todo tranquilo por aquí"
          description="Cuando alguien reaccione a tus publicaciones, te comente o te siga, te avisaremos aquí."
        />
      ) : (
        <Card as="div" className="divide-y divide-line overflow-hidden">
          <ul>
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  href={hrefFor(n)}
                  className={cn("flex items-start gap-3 p-4 hover:bg-surface", !n.read && "bg-brand-soft/60")}
                >
                  <Avatar name={n.actor.displayName} src={n.actor.avatarUrl} size="md" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="text-ink">
                      <span className="inline-flex items-center gap-1 font-bold">
                        {n.actor.displayName}
                        {n.actor.isVerified ? <VerifiedCheck /> : null}
                      </span>{" "}
                      {TEXT[n.type]}
                      {n.postTitle && n.type !== "follow" && n.type !== "like" && n.type !== "helpful" && n.type !== "comment" ? (
                        <>
                          {" "}
                          <span className="font-semibold">«{n.postTitle}»</span>
                        </>
                      ) : null}
                    </p>
                    {n.postTitle && (n.type === "like" || n.type === "helpful" || n.type === "comment") ? (
                      <p className="mt-0.5 truncate text-muted">«{n.postTitle}»</p>
                    ) : null}
                    <p className="mt-0.5 text-xs text-muted" suppressHydrationWarning>
                      {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.read ? <span className="mt-2 size-2.5 shrink-0 rounded-full bg-brand" aria-label="Sin leer" /> : null}
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

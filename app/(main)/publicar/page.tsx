import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PostForm } from "@/components/feed/PostForm";
import { Card } from "@/components/ui/Card";
import { getCommunities, getViewer } from "@/lib/data/viewer";
import type { PostType } from "@/lib/types";

export const metadata: Metadata = { title: "Publicar", robots: { index: false, follow: false } };

const TYPES: PostType[] = ["consejo", "pregunta", "tutorial", "articulo"];

export default async function PublishPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string }>;
}) {
  const [{ tipo }, viewer, communities] = await Promise.all([searchParams, getViewer(), getCommunities()]);
  if (!viewer) redirect("/login?next=/publicar");

  const initialType = TYPES.find((t) => t === tipo) ?? "consejo";
  const active = communities.filter((c) => c.isActive);

  return (
    <Card className="p-5 sm:p-6">
      <h1 className="text-xl font-extrabold text-ink">Comparte lo que sabes</h1>
      <p className="mb-6 mt-1 text-sm text-muted">
        Una buena publicación es clara, específica y útil. Elige el tipo y cuéntalo a tu manera.
      </p>
      <PostForm userId={viewer.id} communities={active} initialType={initialType} />
    </Card>
  );
}

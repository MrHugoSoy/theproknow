import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { POST_TYPE_LABEL, type PostType } from "@/lib/types";

const TYPE_STYLES: Partial<Record<PostType, string>> = {
  pregunta: "bg-question text-white",
  tutorial: "bg-tutorial text-white",
  articulo: "bg-article text-white",
};

/** Badge de tipo. Los "consejo" no llevan badge (como en el mockup). */
export function PostTypeBadge({ type }: { type: PostType }) {
  const style = TYPE_STYLES[type];
  if (!style) return null;
  return (
    <span
      className={cn(
        "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
        style,
      )}
    >
      {POST_TYPE_LABEL[type]}
    </span>
  );
}

export function VerifiedCheck({ className }: { className?: string }) {
  return (
    <BadgeCheck
      aria-label="Verificado"
      className={cn("size-4 fill-brand text-white", className)}
    />
  );
}

export function CountBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold leading-5 text-white",
        className,
      )}
    >
      <span className="sr-only">{count} sin leer</span>
      <span aria-hidden>{count > 99 ? "99+" : count}</span>
    </span>
  );
}

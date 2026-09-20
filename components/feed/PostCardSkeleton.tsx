import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";

export function PostCardSkeleton() {
  return (
    <Card className="p-5" aria-hidden>
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-8 w-16" />
      </div>
      <div className="mt-4 flex gap-4">
        <div className="flex-1 space-y-2.5">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-11/12" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
        <Skeleton className="h-24 w-28 rounded-xl sm:h-[110px] sm:w-[172px]" />
      </div>
      <div className="mt-4 flex gap-4">
        <Skeleton className="h-7 w-14" />
        <Skeleton className="h-7 w-14" />
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-7 w-24" />
      </div>
    </Card>
  );
}

export function FeedSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div role="status" aria-label="Cargando publicaciones" className="space-y-4">
      {Array.from({ length: count }, (_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  );
}

import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-4 w-56" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-56" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border bg-card p-6 space-y-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-3 w-36" />
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 space-y-3">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-56 w-full" />
        </div>
        <div className="rounded-lg border bg-card p-6 space-y-3">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-56 w-full" />
        </div>
      </div>
      <div className="rounded-lg border bg-card p-6 space-y-3">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-48 w-full" />
      </div>
    </div>
  );
}

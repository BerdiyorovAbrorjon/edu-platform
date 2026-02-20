import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLessonsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <Skeleton className="h-9 w-72" />
      <div className="rounded-lg border bg-card p-6 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 flex-1" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

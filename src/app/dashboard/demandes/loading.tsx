import { Skeleton } from '@/components/shared/Skeleton';

export default function DemandesLoading() {
  return (
    <div className="p-6">
      <Skeleton className="h-8 w-72" />
      <Skeleton className="mt-2 h-4 w-full max-w-2xl" />
      <div className="mt-5 flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-8 w-28" />
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
    </div>
  );
}

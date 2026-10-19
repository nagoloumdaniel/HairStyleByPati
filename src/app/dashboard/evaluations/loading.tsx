import { Skeleton } from '@/components/shared/Skeleton';

/* P2.7 : squelette de la file d'évaluations. */
export default function EvaluationsLoading() {
  return (
    <div className="p-6">
      <Skeleton className="h-8 w-72" />
      <Skeleton className="mt-2 h-4 w-full max-w-xl" />
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="mt-6 h-20 w-full" />
      <div className="mt-4 flex flex-col gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

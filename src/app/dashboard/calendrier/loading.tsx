import { Skeleton } from '@/components/shared/Skeleton';

export default function CalendrierLoading() {
  return (
    <div className="p-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-full max-w-lg" />
      <Skeleton className="mt-6 h-12 w-full" />
      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-7">
        {Array.from({ length: 7 }).map((_, index) => (
          <Skeleton key={index} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}

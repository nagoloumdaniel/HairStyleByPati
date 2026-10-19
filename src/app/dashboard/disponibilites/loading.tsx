import { Skeleton } from '@/components/shared/Skeleton';

export default function DisponibilitesLoading() {
  return (
    <div className="p-6">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-2 h-4 w-full max-w-xl" />
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-80 w-full" />
        ))}
      </div>
    </div>
  );
}

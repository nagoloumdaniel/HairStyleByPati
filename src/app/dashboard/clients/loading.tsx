import { Skeleton } from '@/components/shared/Skeleton';

export default function ClientsLoading() {
  return (
    <div className="p-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-2 h-4 w-full max-w-xl" />
      <Skeleton className="mt-5 h-11 w-full max-w-md" />
      <div className="mt-5 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}

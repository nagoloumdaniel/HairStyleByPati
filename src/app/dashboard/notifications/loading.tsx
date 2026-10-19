import { Skeleton } from '@/components/shared/Skeleton';

export default function NotificationsLoading() {
  return (
    <div className="p-6">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="mt-2 h-4 w-full max-w-xl" />
      <div className="mt-5 flex gap-3">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-28" />
      </div>
      <div className="mt-5 space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full" />
        ))}
      </div>
    </div>
  );
}

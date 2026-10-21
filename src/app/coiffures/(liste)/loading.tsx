import { CardSkeleton, Skeleton } from '@/components/shared/Skeleton';

/** P2.7 + P3.2 : squelette du catalogue, même grille que la page chargée. */
export default function CatalogueLoading() {
  return (
    <main aria-busy="true" aria-live="polite" className="page-main space-y-10">
      <p className="sr-only">Chargement du catalogue…</p>
      <Skeleton className="h-4 w-44" />
      <div className="space-y-3">
        <Skeleton className="h-12 w-2/3 max-w-xl" />
        <Skeleton className="h-5 w-full max-w-2xl" />
      </div>
      <Skeleton className="h-44 w-full rounded-[var(--radius-lg)]" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}

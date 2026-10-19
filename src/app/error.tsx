'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <h1 className="font-heading text-3xl font-bold text-ink">Une erreur est survenue</h1>
      <p className="mt-3 max-w-md text-ink-soft">
        La page n’a pas pu être affichée. Réessayez, ou revenez au catalogue si le problème
        persiste.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>Réessayer</Button>
        <Link
          href="/coiffures"
          className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-cream-dark bg-surface px-6 py-3 font-semibold text-ink transition hover:border-cacao hover:bg-cream"
        >
          Voir le catalogue
        </Link>
      </div>
    </main>
  );
}

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Title } from '@/components/ui/Title';

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <Title as="h1" size="display" className="">
        Une erreur est survenue
      </Title>
      <p className="mt-3 max-w-md text-muted">
        La page n’a pas pu être affichée. Réessayez, ou revenez au catalogue si le problème
        persiste.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>Réessayer</Button>
        <Link
          href="/coiffures"
          className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-line bg-card px-6 py-3 font-semibold text-fg transition hover:border-cacao hover:bg-page"
        >
          Voir le catalogue
        </Link>
      </div>
    </main>
  );
}

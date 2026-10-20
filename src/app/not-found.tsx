import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-16 text-center sm:px-6 sm:py-24">
      <div className="bg-gradient-soft glass w-full rounded-[var(--radius-xl)] px-6 py-14 sm:px-12">
        <p
          aria-hidden="true"
          className="text-gradient-primary font-heading text-8xl font-black italic leading-none sm:text-9xl"
        >
          404
        </p>
        <h1 className="mt-6 font-heading text-3xl font-bold text-fg sm:text-4xl">
          Page introuvable
        </h1>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Cette page n’existe pas ou n’est plus disponible. Le catalogue reste accessible pour
          découvrir les prestations du salon.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/coiffures"
            className="bg-gradient-primary inline-flex items-center justify-center rounded-full px-7 py-3 font-bold text-accent-fg shadow-soft transition hover:brightness-110 active:scale-[0.98]"
          >
            Voir le catalogue
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full border border-line bg-card px-7 py-3 font-bold text-fg transition hover:bg-accent-soft"
          >
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </main>
  );
}

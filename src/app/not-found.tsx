import Link from 'next/link';
import type { Metadata } from 'next';
import { Title } from '@/components/ui/Title';

export const metadata: Metadata = {
  title: 'Page introuvable',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main
      data-fullscreen
      className="bg-gradient-soft fixed inset-0 z-30 flex flex-col items-center justify-center overflow-hidden px-6 pb-6 pt-24 text-center"
    >
      <p
        aria-hidden="true"
        className="text-gradient-primary px-[0.15em] pb-[0.05em] font-heading text-[clamp(5rem,min(28vw,28svh),16rem)] font-black italic leading-none"
      >
        404
      </p>
      <Title as="h1" size="display" className="mt-2">
        Page introuvable
      </Title>
      <p className="mt-4 max-w-md text-lg text-muted">
        Cette page n’existe pas ou n’est plus disponible. Le catalogue reste accessible pour
        découvrir les prestations de Patricia.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/coiffures"
          className="bg-gradient-primary inline-flex items-center justify-center rounded-full px-8 py-3.5 font-bold text-accent-fg shadow-soft transition hover:brightness-110 active:scale-[0.98]"
        >
          Voir le catalogue
        </Link>
        <Link
          href="/"
          className="glass inline-flex items-center justify-center rounded-full px-8 py-3.5 font-bold text-fg transition hover:bg-accent-soft"
        >
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';

import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contactez le salon Hairstyle by Patricia : questions, réservation, informations pratiques. Réponse rapide.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-8 sm:px-6 md:py-12">
      <nav aria-label="Fil d'Ariane" className="text-sm text-ink-soft">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="transition hover:text-cacao">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="font-medium text-ink">
              Contact
            </span>
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cacao">Contact</p>
        <h1 className="font-heading text-4xl font-bold text-ink md:text-5xl">Écrivez-nous</h1>
        <p className="text-lg leading-relaxed text-ink-soft">
          Une question sur une prestation, un rendez-vous ou les horaires ? Patricia vous répond
          personnellement.
        </p>
      </header>

      <section className="max-w-3xl">
        <ContactForm />
      </section>

      <section className="max-w-3xl rounded-2xl bg-cream p-8 text-center md:p-10">
        <h2 className="font-heading text-2xl font-bold text-ink">Retrouvez-nous aussi</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Salon Hairstyle by Patricia – coiffures texturées, tresses, vanilles, locs et coiffures
          protectrices.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/coiffures"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-cream-dark bg-surface px-6 py-3 font-semibold text-ink shadow-soft transition hover:border-cacao hover:bg-cream"
          >
            Voir le catalogue
          </Link>
          <Link
            href="/reserver"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent px-6 py-3 font-semibold text-ink shadow-soft transition hover:bg-accent-hover active:scale-[0.98]"
          >
            Réserver un créneau
          </Link>
        </div>
      </section>
    </main>
  );
}

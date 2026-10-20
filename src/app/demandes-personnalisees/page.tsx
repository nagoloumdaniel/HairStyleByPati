import type { Metadata } from 'next';
import Link from 'next/link';
import { CustomRequestForm } from './custom-request-form';
import { Title } from '@/components/ui/Title';

export const metadata: Metadata = {
  title: 'Demande de coiffure personnalisée',
  description:
    'Décrivez votre coiffure sur mesure, ajoutez des photos de référence et recevez une réponse personnalisée de Patricia.',
  alternates: { canonical: '/demandes-personnalisees' },
  openGraph: {
    title: 'Demande de coiffure personnalisée - Hairstyle by Patricia',
    description: 'Décrivez votre coiffure sur mesure et recevez une réponse personnalisée.',
    url: '/demandes-personnalisees',
  },
};

export default function CustomRequestPage() {
  return (
    <main className="page-main">
      <nav aria-label="Fil d'Ariane" className="text-sm text-ink-soft">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="transition hover:text-cacao">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="font-medium text-fg">
              Demande personnalisée
            </span>
          </li>
        </ol>
      </nav>

      <header className="mt-4 max-w-3xl space-y-4">
        <p className="hidden text-sm font-semibold uppercase tracking-wide text-cacao md:block">
          Sur mesure
        </p>
        <Title as="h1" size="display" className="">
          Une coiffure qui n’est pas au catalogue ?
        </Title>
        <p className="hidden text-lg leading-relaxed text-ink-soft md:block">
          Décrivez votre projet, ajoutez jusqu’à 3 photos de référence et vos informations
          capillaires. Patricia étudie chaque demande personnellement et vous répond avec une
          proposition adaptée.
        </p>
        <div className="grid gap-3 text-sm text-ink-soft sm:grid-cols-3">
          <p className="rounded-[var(--radius-md)] border border-line bg-card p-3">
            <span className="font-semibold text-fg">1.</span> Décrivez votre coiffure
          </p>
          <p className="rounded-[var(--radius-md)] border border-line bg-card p-3">
            <span className="font-semibold text-fg">2.</span> Patricia étudie la faisabilité
          </p>
          <p className="rounded-[var(--radius-md)] border border-line bg-card p-3">
            <span className="font-semibold text-fg">3.</span> Vous réservez si la proposition vous
            convient
          </p>
        </div>
      </header>

      <section className="mt-8" aria-labelledby="formulaire-demande">
        <Title as="h2" id="formulaire-demande" className="">
          Votre demande
        </Title>
        <p className="mt-1 text-sm text-ink-soft">
          Une demande ne réserve pas de créneau. Aucun paiement n’est demandé.
        </p>
        <div className="mt-5">
          <CustomRequestForm />
        </div>
      </section>
    </main>
  );
}

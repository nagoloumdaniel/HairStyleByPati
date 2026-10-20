import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getCompatibilityServiceBySlug,
  listPublishedServicesForCompatibility,
  questionsForService,
} from '@/modules/compatibilite/queries';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { CompatibilityWizard } from './compatibility-wizard';
import { Title } from '@/components/ui/Title';

export const metadata: Metadata = {
  title: 'Compatibilité capillaire',
  description:
    'Vérifiez en quelques questions si votre longueur de cheveux et votre situation capillaire permettent la prestation choisie. Patricia peut aussi évaluer une photo.',
  alternates: { canonical: '/compatibilite' },
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function CompatibilitePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const slug = firstValue(params.service).trim();

  if (slug === '') {
    const services = await listPublishedServicesForCompatibility();
    return (
      <main className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 md:py-12">
        <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="transition hover:text-cacao">
                Accueil
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <span aria-current="page" className="font-medium text-fg">
                Compatibilité
              </span>
            </li>
          </ol>
        </nav>

        <header className="max-w-3xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cacao">
            Avant de réserver
          </p>
          <Title as="h1" size="display" className="">
            Vérifiez la compatibilité de votre coiffure
          </Title>
          <p className="text-lg leading-relaxed text-muted">
            Chaque prestation a ses propres exigences. Quelques questions suffisent pour savoir si
            elle est réalisable sur vos cheveux, ou pour demander une évaluation à Patricia.
          </p>
        </header>

        {services.length === 0 ? (
          <EmptyState
            title="Catalogue en cours de mise à jour"
            message="Aucune prestation publiée pour le moment. Revenez très bientôt."
            actionLabel="Voir le catalogue"
            actionHref="/coiffures"
          />
        ) : (
          <section aria-labelledby="choix-prestation" className="space-y-4">
            <Title as="h2" id="choix-prestation" className="">
              Choisissez votre prestation
            </Title>
            <ul className="grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/compatibilite?service=${encodeURIComponent(service.slug)}`}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-line bg-card p-4 shadow-soft transition hover:border-cacao hover:bg-page"
                  >
                    <span>
                      <span className="block font-semibold text-fg">{service.name}</span>
                      <span className="text-sm text-muted">{service.categoryName}</span>
                    </span>
                    <span aria-hidden="true" className="text-cacao">
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    );
  }

  const service = await getCompatibilityServiceBySlug(slug);
  if (!service) notFound();

  const questions = questionsForService(service);

  return (
    <main className="mx-auto w-full max-w-4xl space-y-8 px-4 py-8 sm:px-6 md:py-12">
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="transition hover:text-cacao">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/coiffures" className="transition hover:text-cacao">
              Coiffures
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href={`/coiffures/${service.slug}`} className="transition hover:text-cacao">
              {service.name}
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="font-medium text-fg">
              Compatibilité
            </span>
          </li>
        </ol>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{service.categoryName}</Badge>
          <Badge tone="accent">Compatibilité capillaire</Badge>
        </div>
        <Title as="h1" size="display" className="">
          Votre coiffure est-elle compatible ?
        </Title>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          Répondez uniquement aux questions utiles pour <strong>{service.name}</strong>. Aucune
          réservation n’est créée à cette étape : Patricia valide les cas particuliers avant de
          confirmer un rendez-vous.
        </p>
      </header>

      <CompatibilityWizard
        serviceSlug={service.slug}
        serviceName={service.name}
        rule={service.rule}
        questions={questions}
      />
    </main>
  );
}

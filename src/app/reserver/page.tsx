import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getBookableServiceBySlug, listBookableServices } from '@/modules/reservations/queries';
import { getCachedSalonSettings } from '@/lib/public-cache';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { BookingWizard } from './booking-wizard';
import { Title } from '@/components/ui/Title';

export const metadata: Metadata = {
  title: 'Réserver un rendez-vous',
  description:
    'Réservez votre rendez-vous chez Hairstyle by Patricia : choix de la prestation, vérification capillaire, options, créneau et confirmation. Paiement sur place.',
  alternates: { canonical: '/reserver' },
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

export default async function ReserverPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const slug = firstValue(params.service).trim();

  if (slug === '') {
    const [services, settings] = await Promise.all([
      listBookableServices(),
      getCachedSalonSettings(),
    ]);
    return (
      <main className="page-main page-main-medium space-y-8">
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
                Réserver
              </span>
            </li>
          </ol>
        </nav>

        <header className="max-w-3xl space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cacao">
            Réservation en ligne
          </p>
          <Title as="h1" size="display" className="">
            Choisissez votre coiffure
          </Title>
          <p className="text-lg leading-relaxed text-muted">
            Sélectionnez la prestation, vérifiez sa compatibilité avec vos cheveux, choisissez vos
            options puis un créneau disponible. Le paiement se fait sur place.
          </p>
        </header>

        {services.length === 0 ? (
          <EmptyState
            title="Catalogue en cours de mise à jour"
            message="Aucune prestation réservable pour le moment. Revenez très bientôt."
            actionLabel="Voir le catalogue"
            actionHref="/coiffures"
          />
        ) : (
          <section aria-labelledby="choix-prestation" className="space-y-4">
            <Title as="h2" id="choix-prestation" className="">
              Prestations disponibles
            </Title>
            <ul className="grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <li key={service.id}>
                  <Link
                    href={`/reserver?service=${encodeURIComponent(service.slug)}`}
                    className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-line bg-card p-4 shadow-soft transition hover:border-cacao hover:bg-page"
                  >
                    <span>
                      <span className="block font-semibold text-fg">{service.name}</span>
                      <span className="text-sm text-muted">{service.categoryName}</span>
                    </span>
                    <ArrowRight aria-hidden="true" className="size-4 text-cacao" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="text-sm text-muted">
              Annulation en ligne possible jusqu’à {settings.minCancelNoticeHours} h avant le
              rendez-vous. Paiement sur place.
            </p>
          </section>
        )}
      </main>
    );
  }

  const service = await getBookableServiceBySlug(slug);
  if (!service) notFound();
  const settings = await getCachedSalonSettings();

  return (
    <main className="page-main page-main-medium space-y-8">
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
              Réserver
            </span>
          </li>
        </ol>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{service.categoryName}</Badge>
          <Badge tone="accent">Paiement sur place</Badge>
        </div>
        <Title as="h1" size="display" className="">
          Réserver {service.name}
        </Title>
        <p className="max-w-2xl text-lg leading-relaxed text-muted">
          Huit étapes, sans paiement en ligne. Votre créneau est protégé dès l’enregistrement.
        </p>
      </header>

      <BookingWizard
        service={service}
        settings={{
          minCancelNoticeHours: settings.minCancelNoticeHours,
          holdSlotMinutes: settings.holdSlotMinutes,
          maxAdvanceDays: settings.maxAdvanceDays,
          cancelReasonRequired: settings.cancelReasonRequired,
        }}
      />
    </main>
  );
}

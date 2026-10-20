import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getBookableServiceBySlug } from '@/modules/reservations/queries';
import { getCachedSalonSettings } from '@/lib/public-cache';
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

  // Plus de liste ici : le choix de la prestation se fait dans le catalogue.
  if (slug === '') redirect('/coiffures');

  const service = await getBookableServiceBySlug(slug);
  if (!service) notFound();
  const settings = await getCachedSalonSettings();

  return (
    <main className="page-main space-y-8">
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
        <p className="hidden max-w-2xl text-lg leading-relaxed text-muted md:block">
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

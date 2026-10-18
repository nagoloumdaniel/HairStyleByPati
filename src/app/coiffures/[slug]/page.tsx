import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ServiceGallery } from '@/components/catalogue/ServiceGallery';
import { Badge } from '@/components/ui/Badge';
import {
  HAIR_LENGTH_LABELS,
  PHOTO_POLICY_LABELS,
  bookingHref,
  formatDuration,
  formatPrice,
  getPublishedServiceBySlug,
  serviceGallery,
} from '@/lib/catalogue';

type ServicePageProps = { params: Promise<{ slug: string }> };

function truncate(text: string | null, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);
  if (!service) return { title: 'Coiffure introuvable' };

  const description = truncate(service.description, 160);
  return {
    title: service.name,
    description:
      description ||
      `${service.name} chez Hairstyle by Patricia : ${formatPrice(service)}, ${formatDuration(service.durationMinutes)}. Réservez en ligne.`,
    alternates: { canonical: `/coiffures/${service.slug}` },
    openGraph: {
      title: `${service.name} — Hairstyle by Patricia`,
      description,
      type: 'website',
      url: `/coiffures/${service.slug}`,
    },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = await getPublishedServiceBySlug(slug);
  if (!service) notFound();

  const images = serviceGallery(service);
  const compatibility = service.compatibility;
  const acceptedLengths = compatibility?.acceptedLengths ?? [];
  const photoPolicyLabel = compatibility ? PHOTO_POLICY_LABELS[compatibility.photoPolicy] : null;
  const hasCompatibilityInfo =
    Boolean(compatibility) &&
    (acceptedLengths.length > 0 ||
      compatibility?.requiresLocs ||
      compatibility?.incompatibleLocs ||
      Boolean(photoPolicyLabel) ||
      Boolean(compatibility?.incompatibleMessage) ||
      Boolean(compatibility?.uncertainMessage));

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 px-4 py-8 sm:px-6 md:py-12">
      <nav aria-label="Fil d'Ariane" className="text-sm text-ink-soft">
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
            <span aria-current="page" className="font-medium text-ink">
              {service.name}
            </span>
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-12">
        <ServiceGallery images={images} serviceName={service.name} />

        <div className="space-y-7">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="neutral">{service.category.name}</Badge>
              {service.options.length > 0 ? (
                <Badge tone="accent">
                  {service.options.length} option{service.options.length > 1 ? 's' : ''}
                </Badge>
              ) : null}
            </div>
            <h1 className="font-heading text-4xl font-bold text-ink md:text-5xl">{service.name}</h1>
            {service.description ? (
              <p className="whitespace-pre-line text-lg leading-relaxed text-ink-soft">
                {service.description}
              </p>
            ) : null}
          </div>

          <dl className="grid grid-cols-1 gap-4 rounded-[var(--radius-lg)] border border-cream-dark bg-surface p-5 shadow-soft sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">Tarif</dt>
              <dd className="mt-1 font-heading text-2xl font-bold text-ink">
                {formatPrice(service)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
                Durée estimée
              </dt>
              <dd className="mt-1 font-heading text-2xl font-bold text-ink">
                {formatDuration(service.durationMinutes)}
              </dd>
            </div>
            {service.priceOnRequest ? (
              <p className="col-span-2 text-sm leading-relaxed text-cacao">
                Une évaluation de vos cheveux est nécessaire avant de confirmer le rendez-vous et le
                tarif.
              </p>
            ) : null}
          </dl>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href={bookingHref(service.slug)}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent px-6 py-3.5 text-lg font-semibold text-ink shadow-soft transition hover:bg-accent-hover active:scale-[0.98]"
            >
              Réserver cette coiffure
            </Link>
            <Link
              href={`/coiffures?category=${encodeURIComponent(service.category.slug)}`}
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-cream-dark bg-surface px-6 py-3.5 font-semibold text-ink transition hover:border-cacao hover:bg-cream"
            >
              Voir la catégorie
            </Link>
          </div>

          {service.options.length > 0 ? (
            <section aria-labelledby="options-titre" className="space-y-3">
              <h2 id="options-titre" className="font-heading text-2xl font-bold text-ink">
                Options disponibles
              </h2>
              <ul className="divide-y divide-cream-dark rounded-[var(--radius-lg)] border border-cream-dark bg-surface">
                {service.options.map((option) => (
                  <li
                    key={option.id}
                    className="flex items-baseline justify-between gap-4 px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-ink">{option.name}</p>
                      {option.durationMinutes > 0 ? (
                        <p className="text-sm text-ink-soft">
                          +{formatDuration(option.durationMinutes)}
                        </p>
                      ) : null}
                    </div>
                    <p className="whitespace-nowrap font-semibold text-cacao">
                      +
                      {formatPrice({
                        priceFromCents: option.priceCents,
                        priceToCents: option.priceCents,
                        priceOnRequest: false,
                      })}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="text-sm text-ink-soft">
                Les options s’ajoutent au tarif de base et sont choisies pendant la réservation.
              </p>
            </section>
          ) : null}

          <section aria-labelledby="compatibilite-titre" className="space-y-3">
            <h2 id="compatibilite-titre" className="font-heading text-2xl font-bold text-ink">
              Compatibilité capillaire
            </h2>
            {hasCompatibilityInfo ? (
              <ul className="space-y-2 rounded-[var(--radius-lg)] border border-cream-dark bg-surface p-5 text-ink-soft">
                {acceptedLengths.length > 0 ? (
                  <li>
                    <span className="font-semibold text-ink">Longueurs acceptées : </span>
                    {acceptedLengths.map((length) => HAIR_LENGTH_LABELS[length]).join(', ')}
                  </li>
                ) : null}
                {compatibility?.requiresLocs ? (
                  <li>Cette prestation nécessite des locs déjà posées.</li>
                ) : null}
                {compatibility?.incompatibleLocs ? (
                  <li>Cette prestation n’est pas compatible avec des locs.</li>
                ) : null}
                {photoPolicyLabel ? <li>{photoPolicyLabel}</li> : null}
                {compatibility?.autoApprove ? (
                  <li>La compatibilité est validée automatiquement à partir de vos réponses.</li>
                ) : (
                  <li>Patricia vérifie les informations capillaires avant de confirmer.</li>
                )}
                {compatibility?.incompatibleMessage ? (
                  <li className="rounded-[var(--radius-sm)] bg-alert-soft px-3 py-2 text-alert">
                    {compatibility.incompatibleMessage}
                  </li>
                ) : null}
                {compatibility?.uncertainMessage ? (
                  <li className="rounded-[var(--radius-sm)] bg-accent-soft px-3 py-2 text-ink">
                    {compatibility.uncertainMessage}
                  </li>
                ) : null}
              </ul>
            ) : (
              <p className="rounded-[var(--radius-lg)] border border-cream-dark bg-surface p-5 text-ink-soft">
                Aucune restriction de compatibilité n’est renseignée pour cette prestation. Patricia
                vérifie vos informations capillaires avant de confirmer le rendez-vous.
              </p>
            )}
          </section>

          <section aria-labelledby="infos-titre" className="space-y-3">
            <h2 id="infos-titre" className="font-heading text-2xl font-bold text-ink">
              Avant votre rendez-vous
            </h2>
            <ul className="space-y-2 text-ink-soft">
              <li>Le paiement s’effectue sur place ; aucun paiement en ligne n’est demandé.</li>
              <li>Merci d’arriver avec des cheveux propres et démêlés.</li>
              <li>Signalez toute allergie ou sensibilité du cuir chevelu avant la prestation.</li>
              <li>
                La durée affichée est une estimation : elle peut varier selon la longueur et la
                densité de vos cheveux.
              </li>
            </ul>
          </section>
        </div>
      </div>

      <div className="border-t border-cream-dark pt-6">
        <Link
          href="/coiffures"
          className="inline-flex items-center gap-2 font-semibold text-cacao transition hover:text-ink"
        >
          <span aria-hidden="true">←</span> Retour au catalogue
        </Link>
      </div>
    </main>
  );
}

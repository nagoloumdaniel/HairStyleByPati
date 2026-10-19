import Image from 'next/image';
import { IMAGE_BLUR_DATA_URL } from '@/lib/image-placeholder';
import Link from 'next/link';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  bookingHref,
  formatDuration,
  formatPrice,
  serviceImage,
  type CatalogueService,
} from '@/lib/catalogue';

const IMAGE_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

/**
 * Carte prestation du catalogue (§4.2) : photo, nom, prix, description,
 * durée, catégorie + actions « Voir les détails » et « Réserver ».
 * Server Component : aucun JavaScript client n'est envoyé pour la carte.
 */
export function ServiceCard({
  service,
  priority = false,
}: {
  service: CatalogueService;
  priority?: boolean;
}) {
  const image = serviceImage(service);
  const optionsLabel =
    service.options.length === 1
      ? '1 option disponible'
      : `${service.options.length} options disponibles`;

  return (
    <Card className="group flex h-full flex-col overflow-hidden p-0 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="relative aspect-[4/3] overflow-hidden bg-line">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={IMAGE_SIZES}
          priority={priority}
          placeholder="blur"
          blurDataURL={IMAGE_BLUR_DATA_URL}
          quality={80}
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <Badge tone="neutral" className="absolute left-3 top-3">
          {service.category.name}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-heading text-xl font-bold text-fg">{service.name}</h3>

        {service.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">{service.description}</p>
        ) : null}

        <dl className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
          <div>
            <dt className="sr-only">Prix</dt>
            <dd className="font-heading text-lg font-bold text-fg">{formatPrice(service)}</dd>
          </div>
          <div>
            <dt className="sr-only">Durée estimée</dt>
            <dd className="text-sm text-muted">{formatDuration(service.durationMinutes)}</dd>
          </div>
        </dl>

        {service.options.length > 0 ? (
          <p className="text-xs font-medium text-cacao">{optionsLabel}</p>
        ) : null}

        <div className="mt-auto flex flex-col gap-2 pt-2 sm:flex-row">
          <Link
            href={`/coiffures/${service.slug}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-line bg-card px-4 py-2.5 text-sm font-semibold text-fg transition hover:border-cacao hover:bg-page"
          >
            Voir les détails
          </Link>
          <Link
            href={bookingHref(service.slug)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg shadow-soft transition hover:bg-accent-hover active:scale-[0.98]"
          >
            Réserver
          </Link>
        </div>
      </div>
    </Card>
  );
}

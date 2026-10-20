import type { Metadata } from 'next';
import Link from 'next/link';
import { ServiceCard } from '@/components/catalogue/ServiceCard';
import { CardCarousel } from '@/components/catalogue/CardCarousel';
import { EmptyState } from '@/components/shared/EmptyState';
import { getPublishedCategories, getPublishedServices, parseCatalogueQuery } from '@/lib/catalogue';
import { CatalogueFilters } from '../catalogue-filters';
import { Title } from '@/components/ui/Title';

export const metadata: Metadata = {
  title: 'Catalogue des coiffures',
  description:
    'Découvrez les prestations de Hairstyle by Patricia : tresses, vanilles, locs, départ de locs, coiffures protectrices et coupes. Prix, durées et réservation en ligne.',
  alternates: { canonical: '/coiffures' },
};

function pageHref(search: string, category: string, page: number): string {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/coiffures?${query}` : '/coiffures';
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = parseCatalogueQuery(await searchParams);
  const [categories, result] = await Promise.all([
    getPublishedCategories(),
    getPublishedServices(query),
  ]);

  const { services, total, page, totalPages, pageSize } = result;
  const search = query.search ?? '';
  const category = query.category ?? '';
  const hasFilters = search !== '' || category !== '';
  const firstResult = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastResult = Math.min(page * pageSize, total);

  return (
    <main className="mx-auto w-full max-w-7xl space-y-10 px-4 py-8 sm:px-6 md:py-12">
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
              Coiffures
            </span>
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cacao">Catalogue</p>
        <Title as="h1" size="display" className="">
          Coiffures et prestations
        </Title>
        <p className="text-lg leading-relaxed text-muted">
          Chaque prestation est réalisée sur mesure par Patricia, selon votre nature de cheveux et
          vos envies. Prix, durée et options sont affichés avant la réservation.
        </p>
      </header>

      <CatalogueFilters
        categories={categories}
        initialSearch={search}
        initialCategory={category}
        total={total}
      />

      <section aria-labelledby="resultats-titre" className="space-y-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <Title as="h2" id="resultats-titre" className="">
            {hasFilters ? 'Résultats de votre recherche' : 'Toutes les coiffures'}
          </Title>
          {total > 0 ? (
            <p className="text-sm text-muted">
              Affichage de {firstResult} à {lastResult} sur {total}
            </p>
          ) : null}
        </div>

        {services.length === 0 ? (
          <EmptyState
            title="Aucune coiffure ne correspond"
            message={
              hasFilters
                ? 'Essayez un autre mot-clé ou une autre catégorie pour trouver la prestation qui vous convient.'
                : 'Le catalogue est en cours de mise à jour. Revenez très bientôt pour découvrir les prestations.'
            }
            actionLabel={hasFilters ? 'Voir toutes les coiffures' : undefined}
            actionHref={hasFilters ? '/coiffures' : undefined}
          />
        ) : (
          <CardCarousel label="Prestations du catalogue">
            {services.map((service, index) => (
              <ServiceCard key={service.id} service={service} priority={index < 3} />
            ))}
          </CardCarousel>
        )}

        {totalPages > 1 ? (
          <nav
            aria-label="Pagination du catalogue"
            className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6"
          >
            {page > 1 ? (
              <Link
                href={pageHref(search, category, page - 1)}
                rel="prev"
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-line bg-card px-4 py-2.5 text-sm font-semibold text-fg transition hover:border-cacao hover:bg-page"
              >
                <span aria-hidden="true">←</span> Page précédente
              </Link>
            ) : (
              <span aria-disabled="true" className="text-sm text-muted">
                <span aria-hidden="true">←</span> Page précédente
              </span>
            )}

            <p className="text-sm text-muted" aria-current="page">
              Page {page} sur {totalPages}
            </p>

            {page < totalPages ? (
              <Link
                href={pageHref(search, category, page + 1)}
                rel="next"
                className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-line bg-card px-4 py-2.5 text-sm font-semibold text-fg transition hover:border-cacao hover:bg-page"
              >
                Page suivante <span aria-hidden="true">→</span>
              </Link>
            ) : (
              <span aria-disabled="true" className="text-sm text-muted">
                Page suivante <span aria-hidden="true">→</span>
              </span>
            )}
          </nav>
        ) : null}
      </section>
    </main>
  );
}

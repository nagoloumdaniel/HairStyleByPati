import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import {
  getCatalogueStats,
  listAdminCategories,
  listAdminServices,
  type AdminService,
} from '@/lib/catalogue-admin';
import { adminServiceFiltersSchema } from '@/modules/catalogue/schemas';
import { formatDuration, formatPrice } from '@/lib/catalogue';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/shared/EmptyState';
import { ServiceActionsRow } from './service-actions-row';
import { CategoriesTab } from './categories-tab';

export const metadata: Metadata = { title: 'Catalogue - Tableau de bord' };

const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Brouillon',
  PUBLISHED: 'Publié',
  ARCHIVED: 'Archivé',
};

const STATUS_TONES: Record<string, 'accent' | 'success' | 'alert' | 'neutral'> = {
  DRAFT: 'neutral',
  PUBLISHED: 'success',
  ARCHIVED: 'alert',
};

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function statCard(label: string, value: number, tone: string) {
  return (
    <div
      key={label}
      className="rounded-[var(--radius-lg)] border border-line bg-card p-4 shadow-soft"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className={`mt-1 font-heading text-3xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/catalogue');

  const rawParams = await searchParams;
  const filtersResult = adminServiceFiltersSchema.safeParse({
    search: firstValue(rawParams.search),
    categoryId: firstValue(rawParams.category),
    status: firstValue(rawParams.status),
  });
  const filters = filtersResult.success
    ? filtersResult.data
    : { search: undefined, categoryId: undefined, status: undefined };

  const [categories, services, stats] = await Promise.all([
    listAdminCategories(),
    listAdminServices(filters),
    getCatalogueStats(),
  ]);

  const search = filters.search ?? '';
  const category = filters.categoryId ?? '';
  const status = filters.status ?? '';
  const hasFilters = search !== '' || category !== '' || status !== '';

  const prestationsPanel = (
    <div>
      <form
        method="get"
        action="/dashboard/catalogue"
        className="flex flex-col gap-3 border-b border-line p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <div className="min-w-0 flex-1 sm:min-w-[220px]">
          <Input
            label="Rechercher"
            name="search"
            type="search"
            defaultValue={search}
            placeholder="Nom, slug, description"
          />
        </div>
        <Select
          label="Catégorie"
          name="category"
          defaultValue={category}
          options={[
            { value: '', label: 'Toutes les catégories' },
            ...categories.map((item) => ({
              value: item.id,
              label: item.active ? item.name : `${item.name} (désactivée)`,
            })),
          ]}
        />
        <Select
          label="Statut"
          name="status"
          defaultValue={status}
          options={[
            { value: '', label: 'Tous les statuts' },
            { value: 'DRAFT', label: 'Brouillon' },
            { value: 'PUBLISHED', label: 'Publié' },
            { value: 'ARCHIVED', label: 'Archivé' },
          ]}
        />
        <div className="flex items-center gap-2 pb-0.5">
          <Button type="submit">Filtrer</Button>
          {hasFilters ? (
            <Link
              href="/dashboard/catalogue"
              className="text-sm font-semibold text-cacao underline-offset-4 hover:underline"
            >
              Réinitialiser
            </Link>
          ) : null}
        </div>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <p className="text-sm text-muted">
          {services.length} prestation{services.length > 1 ? 's' : ''}
          {hasFilters ? ' correspondent aux filtres' : ' au total'}
        </p>
        <Link
          href="/dashboard/catalogue/prestations/nouvelle"
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-accent px-4 py-2.5 text-sm font-semibold text-accent-fg shadow-soft transition hover:bg-accent-hover active:scale-[0.98]"
        >
          <span aria-hidden="true">+</span> Nouvelle prestation
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="p-4">
          <EmptyState
            title={hasFilters ? 'Aucune prestation ne correspond' : 'Le catalogue est vide'}
            message={
              hasFilters
                ? 'Modifiez la recherche ou les filtres pour retrouver vos prestations.'
                : 'Créez votre première prestation pour la voir apparaître sur le site public.'
            }
            actionLabel={hasFilters ? 'Effacer les filtres' : 'Créer une prestation'}
            actionHref={
              hasFilters ? '/dashboard/catalogue' : '/dashboard/catalogue/prestations/nouvelle'
            }
          />
        </div>
      ) : (
        <>
          {/* Mobile : cartes empilées, aucun défilement horizontal. */}
          <ul className="flex flex-col gap-3 p-4 md:hidden">
            {services.map((service) => (
              <li key={service.id} className="rounded-[var(--radius-md)] border border-line p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{service.name}</p>
                    <p className="truncate text-xs text-muted">
                      {service.categoryName} · {service.imageCount} photo
                      {service.imageCount > 1 ? 's' : ''}
                    </p>
                  </div>
                  <Badge tone={STATUS_TONES[service.status] ?? 'neutral'}>
                    {STATUS_LABELS[service.status] ?? service.status}
                  </Badge>
                </div>
                <p className="mt-3 text-sm">
                  {formatPrice(service)} · {formatDuration(service.durationMinutes)}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/catalogue/prestations/${service.id}`}
                    className="rounded-[var(--radius-sm)] border border-line px-3 py-1.5 text-sm font-semibold transition hover:border-cacao"
                  >
                    Modifier
                  </Link>
                </div>
                <ServiceActionsRow service={service} />
              </li>
            ))}
          </ul>

          {/* Desktop : tableau dense et lisible avec défilement horizontal maîtrisé. */}
          <div className="hidden overflow-x-auto p-4 md:block">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  <th scope="col" className="pb-3 text-sm font-semibold">
                    Prestation
                  </th>
                  <th scope="col" className="pb-3 text-sm font-semibold">
                    Catégorie
                  </th>
                  <th scope="col" className="pb-3 text-sm font-semibold">
                    Prix
                  </th>
                  <th scope="col" className="pb-3 text-sm font-semibold">
                    Durée
                  </th>
                  <th scope="col" className="pb-3 text-sm font-semibold">
                    Statut
                  </th>
                  <th scope="col" className="pb-3 text-right text-sm font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {services.map((service: AdminService) => (
                  <tr key={service.id} className="border-b border-line align-top">
                    <td className="p-4">
                      <Link
                        href={`/dashboard/catalogue/prestations/${service.id}`}
                        className="font-semibold underline-offset-4 hover:text-cacao hover:underline"
                      >
                        {service.name}
                      </Link>
                      <div className="text-xs text-muted">{service.slug}</div>
                    </td>
                    <td className="p-4 text-sm">{service.categoryName}</td>
                    <td className="p-4 text-sm">{formatPrice(service)}</td>
                    <td className="p-4 text-sm">{formatDuration(service.durationMinutes)}</td>
                    <td className="p-4">
                      <Badge tone={STATUS_TONES[service.status] ?? 'neutral'}>
                        {STATUS_LABELS[service.status] ?? service.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <ServiceActionsRow service={service} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Catalogue des prestations</h1>
        <p className="text-muted">
          Gérez vos catégories, vos prestations, leurs photos et leurs règles de compatibilité.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {statCard('Publiées', stats.published, 'text-success')}
        {statCard('Brouillons', stats.draft, 'text-fg')}
        {statCard('Archivées', stats.archived, 'text-alert')}
        {statCard('Catégories', stats.categories, 'text-cacao')}
      </div>

      <Card className="mt-6 p-0">
        <Tabs
          tabs={[
            {
              id: 'prestations',
              label: `Prestations (${stats.total})`,
              content: prestationsPanel,
            },
            {
              id: 'categories',
              label: `Catégories (${stats.categories})`,
              content: <CategoriesTab categories={categories} />,
            },
          ]}
        />
      </Card>
    </div>
  );
}

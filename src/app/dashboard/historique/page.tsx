import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import {
  AUDIT_PAGE_SIZE,
  countCatalogueAuditLogs,
  listCatalogueAuditLogs,
} from '@/modules/stats/audit';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/shared/EmptyState';

export const metadata: Metadata = { title: 'Historique - Tableau de bord' };

const ACTION_LABELS: Record<string, string> = {
  'category.create': 'Création de catégorie',
  'category.update': 'Modification de catégorie',
  'category.delete': 'Suppression de catégorie',
  'category.publish': 'Activation de catégorie',
  'category.unpublish': 'Désactivation de catégorie',
  'category.reorder': 'Réordonnancement des catégories',
  'service.create': 'Création de prestation',
  'service.update': 'Modification de prestation',
  'service.publish': 'Publication de prestation',
  'service.unpublish': 'Dépublication de prestation',
  'service.archive': 'Archivage de prestation',
  'service.delete': 'Suppression de prestation',
  'service.option.create': "Ajout d'une option",
  'service.option.update': "Modification d'une option",
  'service.option.delete': "Suppression d'une option",
  'service.option.publish': "Activation d'une option",
  'service.option.unpublish': "Désactivation d'une option",
  'service.image.upload': 'Ajout de photo',
  'service.image.alt': 'Texte alternatif de photo',
  'service.image.primary': 'Photo principale',
  'service.image.delete': 'Suppression de photo',
  'service.image.reorder': 'Réordonnancement des photos',
  'service.compatibility.update': 'Règles de compatibilité',
  'service.question.create': 'Ajout de question',
  'service.question.update': 'Modification de question',
  'service.question.delete': 'Suppression de question',
  'service.question.reorder': 'Réordonnancement des questions',
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function pageHref(page: number, entityId: string): string {
  const params = new URLSearchParams();
  if (page > 1) params.set('page', String(page));
  if (entityId) params.set('entityId', entityId);
  const query = params.toString();
  return query ? `/dashboard/historique?${query}` : '/dashboard/historique';
}

export default async function HistoriquePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/historique');

  const params = await searchParams;
  const entityId = firstValue(params.entityId);
  const rawPage = Number.parseInt(firstValue(params.page), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  const skip = (page - 1) * AUDIT_PAGE_SIZE;

  const [entries, total] = await Promise.all([
    listCatalogueAuditLogs({ skip, entityId: entityId || undefined }),
    countCatalogueAuditLogs(entityId || undefined),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / AUDIT_PAGE_SIZE));

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Historique du catalogue</h1>
          <p className="mt-1 text-muted">
            Toutes les actions de Patricia sur les catégories, prestations, photos, options, règles
            et questions.
          </p>
        </div>
        {entityId ? (
          <Link
            href="/dashboard/historique"
            className="text-sm font-semibold text-cacao underline-offset-4 hover:underline"
          >
            Voir tout l’historique
          </Link>
        ) : null}
      </div>

      <Card className="mt-6 p-0">
        {entries.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Aucune action enregistrée"
              message="Les modifications du catalogue apparaîtront ici avec leur auteur et leur date."
              actionLabel="Ouvrir le catalogue"
              actionHref="/dashboard/catalogue"
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {entries.map((entry) => (
              <li
                key={entry.id}
                className="flex flex-col gap-1 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {ACTION_LABELS[entry.action] ?? entry.action}{' '}
                    <span className="font-normal text-muted">({entry.entityType})</span>
                  </p>
                  <p className="text-sm text-muted">
                    {entry.userName ?? 'Utilisateur inconnu'}
                    {entry.entityId ? ` · référence ${entry.entityId}` : ''}
                  </p>
                </div>
                <time
                  dateTime={entry.createdAt.toISOString()}
                  className="shrink-0 text-sm text-muted"
                >
                  {dateFormatter.format(entry.createdAt)}
                </time>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {totalPages > 1 ? (
        <nav
          aria-label="Pagination de l'historique"
          className="mt-4 flex flex-wrap items-center justify-between gap-3"
        >
          {page > 1 ? (
            <Link
              href={pageHref(page - 1, entityId)}
              rel="prev"
              className="rounded-[var(--radius-md)] border border-line bg-card px-4 py-2 text-sm font-semibold transition hover:border-cacao"
            >
              Page précédente
            </Link>
          ) : (
            <span className="text-sm text-muted">Page précédente</span>
          )}
          <p className="text-sm text-muted">
            Page {page} sur {totalPages} · {total} action{total > 1 ? 's' : ''}
          </p>
          {page < totalPages ? (
            <Link
              href={pageHref(page + 1, entityId)}
              rel="next"
              className="rounded-[var(--radius-md)] border border-line bg-card px-4 py-2 text-sm font-semibold transition hover:border-cacao"
            >
              Page suivante
            </Link>
          ) : (
            <span className="text-sm text-muted">Page suivante</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}

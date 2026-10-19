import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { AssessmentStatus } from '@prisma/client';
import { requireAdmin } from '@/modules/auth/guards';
import { countAssessmentsByStatus, listAssessments } from '@/modules/compatibilite/queries';
import { ASSESSMENT_STATUS_LABELS } from '@/modules/compatibilite/schemas';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/shared/EmptyState';

export const metadata: Metadata = { title: 'Évaluations capillaires - Tableau de bord' };

const STATUS_TONES: Record<string, 'accent' | 'success' | 'alert' | 'neutral'> = {
  RECEIVED: 'accent',
  IN_PROGRESS: 'accent',
  INFO_REQUESTED: 'neutral',
  ACCEPTED: 'success',
  REFUSED: 'alert',
  BOOKING_PENDING: 'neutral',
  CONFIRMED: 'success',
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function pageHref(status: string, page: number): string {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (page > 1) params.set('page', String(page));
  const query = params.toString();
  return query ? `/dashboard/evaluations?${query}` : '/dashboard/evaluations';
}

export default async function EvaluationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/evaluations');

  const params = await searchParams;
  const rawStatus = firstValue(params.status);
  const status = (Object.keys(ASSESSMENT_STATUS_LABELS).includes(rawStatus) ? rawStatus : '') as
    AssessmentStatus | '';
  const rawPage = Number.parseInt(firstValue(params.page), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const [counts, result] = await Promise.all([
    countAssessmentsByStatus(),
    listAssessments({
      status: status || undefined,
      page,
      order: status === 'ACCEPTED' || status === 'REFUSED' ? 'desc' : 'asc',
    }),
  ]);

  const cards: Array<{ status: AssessmentStatus; label: string }> = [
    { status: 'RECEIVED', label: 'Reçues' },
    { status: 'INFO_REQUESTED', label: 'Infos demandées' },
    { status: 'ACCEPTED', label: 'Acceptées' },
    { status: 'REFUSED', label: 'Refusées' },
  ];

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Évaluations capillaires</h1>
        <p className="text-ink-soft">
          Demandes envoyées depuis le site public. Une décision ne crée jamais de réservation : le
          créneau reste vérifié séparément.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.status}
            href={pageHref(card.status, 1)}
            className={`rounded-[var(--radius-lg)] border bg-surface p-4 shadow-soft transition hover:border-cacao ${
              status === card.status ? 'border-cacao' : 'border-cream-dark'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-soft">
              {card.label}
            </p>
            <p className="mt-1 font-heading text-3xl font-bold text-ink">{counts[card.status]}</p>
          </Link>
        ))}
      </div>

      <Card className="mt-6 p-0">
        <form
          method="get"
          action="/dashboard/evaluations"
          className="flex flex-wrap items-end gap-3 border-b border-cream-dark p-4"
        >
          <div className="min-w-52">
            <Select
              label="Statut"
              name="status"
              defaultValue={status}
              options={[
                { value: '', label: 'Toutes les évaluations' },
                ...Object.entries(ASSESSMENT_STATUS_LABELS).map(([value, label]) => ({
                  value,
                  label,
                })),
              ]}
            />
          </div>
          <Button type="submit">Filtrer</Button>
          {status ? (
            <Link
              href="/dashboard/evaluations"
              className="pb-3 text-sm font-semibold text-cacao underline-offset-4 hover:underline"
            >
              Réinitialiser
            </Link>
          ) : null}
        </form>

        {result.items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Aucune évaluation"
              message={
                status
                  ? 'Aucune évaluation ne correspond à ce statut.'
                  : 'Les demandes envoyées depuis /compatibilite apparaîtront ici.'
              }
              actionLabel={status ? 'Voir toutes les évaluations' : undefined}
              actionHref={status ? '/dashboard/evaluations' : undefined}
            />
          </div>
        ) : (
          <>
            <ul className="divide-y divide-cream-dark md:hidden">
              {result.items.map((assessment) => (
                <li key={assessment.id} className="flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{assessment.customerName}</p>
                      <p className="truncate text-sm text-ink-soft">{assessment.serviceName}</p>
                    </div>
                    <Badge tone={STATUS_TONES[assessment.status] ?? 'neutral'}>
                      {ASSESSMENT_STATUS_LABELS[assessment.status] ?? assessment.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-ink-soft">
                    {dateFormatter.format(assessment.createdAt)} · {assessment.photoCount} photo
                    {assessment.photoCount > 1 ? 's' : ''}
                  </p>
                  <Link
                    href={`/dashboard/evaluations/${assessment.id}`}
                    className="self-start rounded-[var(--radius-sm)] border border-cream-dark px-3 py-1.5 text-sm font-semibold transition hover:border-cacao"
                  >
                    Ouvrir la demande
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-cream-dark">
                    <th scope="col" className="p-4 pb-3 text-sm font-semibold">
                      Cliente
                    </th>
                    <th scope="col" className="p-4 pb-3 text-sm font-semibold">
                      Prestation
                    </th>
                    <th scope="col" className="p-4 pb-3 text-sm font-semibold">
                      Reçue le
                    </th>
                    <th scope="col" className="p-4 pb-3 text-sm font-semibold">
                      Photos
                    </th>
                    <th scope="col" className="p-4 pb-3 text-sm font-semibold">
                      Statut
                    </th>
                    <th scope="col" className="p-4 pb-3 text-right text-sm font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {result.items.map((assessment) => (
                    <tr key={assessment.id} className="border-b border-cream-dark">
                      <td className="p-4">
                        <p className="font-semibold">{assessment.customerName}</p>
                        <p className="text-xs text-ink-soft">{assessment.customerEmail}</p>
                      </td>
                      <td className="p-4 text-sm">{assessment.serviceName}</td>
                      <td className="p-4 text-sm">{dateFormatter.format(assessment.createdAt)}</td>
                      <td className="p-4 text-sm">{assessment.photoCount}</td>
                      <td className="p-4">
                        <Badge tone={STATUS_TONES[assessment.status] ?? 'neutral'}>
                          {ASSESSMENT_STATUS_LABELS[assessment.status] ?? assessment.status}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/dashboard/evaluations/${assessment.id}`}
                          className="text-sm font-semibold text-cacao underline-offset-4 hover:underline"
                        >
                          Ouvrir
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>

      {result.totalPages > 1 ? (
        <nav
          aria-label="Pagination des évaluations"
          className="mt-4 flex flex-wrap items-center justify-between gap-3"
        >
          {result.page > 1 ? (
            <Link
              href={pageHref(status, result.page - 1)}
              rel="prev"
              className="rounded-[var(--radius-md)] border border-cream-dark bg-surface px-4 py-2 text-sm font-semibold transition hover:border-cacao"
            >
              Page précédente
            </Link>
          ) : (
            <span className="text-sm text-ink-soft/60">Page précédente</span>
          )}
          <p className="text-sm text-ink-soft">
            Page {result.page} sur {result.totalPages} · {result.total} demande
            {result.total > 1 ? 's' : ''}
          </p>
          {result.page < result.totalPages ? (
            <Link
              href={pageHref(status, result.page + 1)}
              rel="next"
              className="rounded-[var(--radius-md)] border border-cream-dark bg-surface px-4 py-2 text-sm font-semibold transition hover:border-cacao"
            >
              Page suivante
            </Link>
          ) : (
            <span className="text-sm text-ink-soft/60">Page suivante</span>
          )}
        </nav>
      ) : null}
    </div>
  );
}

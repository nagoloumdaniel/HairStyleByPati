import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { AppointmentStatus } from '@prisma/client';
import { requireAdmin } from '@/modules/auth/guards';
import { countAppointmentsByStatus, listAppointmentsAdmin } from '@/modules/reservations/queries';
import {
  APPOINTMENT_STATUS_LABELS,
  APPOINTMENT_STATUS_SHORT_LABELS,
  APPOINTMENT_STATUS_TONES,
} from '@/modules/reservations/status';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/shared/EmptyState';

export const metadata: Metadata = { title: 'Réservations - Tableau de bord' };

const STATUSES: AppointmentStatus[] = [
  'PENDING',
  'CONFIRMED',
  'RESCHEDULED',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED_BY_CUSTOMER',
  'CANCELLED_BY_ADMIN',
];

function firstValue(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
}

function pageHref(status: string, page: number, all: boolean): string {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (page > 1) params.set('page', String(page));
  if (all) params.set('all', '1');
  const query = params.toString();
  return query ? `/dashboard/reservations?${query}` : '/dashboard/reservations';
}

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export default async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/reservations');

  const params = await searchParams;
  const rawStatus = firstValue(params.status);
  const status = (STATUSES.includes(rawStatus as AppointmentStatus) ? rawStatus : '') as
    AppointmentStatus | '';
  const all = firstValue(params.all) === '1';
  const rawPage = Number.parseInt(firstValue(params.page), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const [counts, result] = await Promise.all([
    countAppointmentsByStatus(),
    listAppointmentsAdmin({ status: status || undefined, page, upcomingOnly: !all }),
  ]);

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Réservations</h1>
        <p className="text-muted">
          Rendez-vous à venir, historique et statuts. Chaque fiche permet de confirmer, annuler ou
          reprogrammer.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {STATUSES.slice(0, 5).map((item) => (
          <Link
            key={item}
            href={pageHref(item, 1, all)}
            className={`rounded-[var(--radius-md)] border bg-card px-3 py-2 text-sm shadow-soft transition hover:border-cacao ${
              status === item ? 'border-cacao' : 'border-line'
            }`}
          >
            <span className="text-muted">{APPOINTMENT_STATUS_LABELS[item]} : </span>
            <span className="font-semibold text-fg">{counts[item] ?? 0}</span>
          </Link>
        ))}
      </div>

      <Card className="mt-6 p-0">
        <form
          method="get"
          action="/dashboard/reservations"
          className="flex flex-wrap items-end gap-3 border-b border-line p-4"
        >
          <div className="min-w-56">
            <Select
              label="Statut"
              name="status"
              defaultValue={status}
              options={[
                { value: '', label: 'Tous les statuts' },
                ...STATUSES.map((item) => ({
                  value: item,
                  label: APPOINTMENT_STATUS_LABELS[item],
                })),
              ]}
            />
          </div>
          <label className="flex items-center gap-2 pb-3 text-sm font-semibold">
            <input type="checkbox" name="all" value="1" defaultChecked={all} className="size-4" />
            Inclure l’historique
          </label>
          <Button type="submit">Filtrer</Button>
          {status || all ? (
            <Link
              href="/dashboard/reservations"
              className="pb-3 text-sm font-semibold text-cacao underline-offset-4 hover:underline"
            >
              Réinitialiser
            </Link>
          ) : null}
        </form>

        {result.items.length === 0 ? (
          <div className="p-4">
            <EmptyState
              title="Aucune réservation"
              message={
                all
                  ? 'Aucun rendez-vous ne correspond à ce filtre.'
                  : 'Aucun rendez-vous à venir. Les nouvelles réservations apparaîtront ici.'
              }
              actionLabel="Ouvrir le calendrier"
              actionHref="/dashboard/calendrier"
            />
          </div>
        ) : (
          <>
            <ul className="divide-y divide-line md:hidden">
              {result.items.map((appointment) => (
                <li key={appointment.id} className="flex flex-col gap-2 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{appointment.customerName}</p>
                      <p className="truncate text-sm text-muted">{appointment.serviceName}</p>
                    </div>
                    <Badge tone={APPOINTMENT_STATUS_TONES[appointment.status]}>
                      {APPOINTMENT_STATUS_SHORT_LABELS[appointment.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted">
                    <LocalDateTime iso={appointment.startsAt.toISOString()} />
                  </p>
                  <Link
                    href={`/dashboard/reservations/${appointment.id}`}
                    className="self-start rounded-[var(--radius-sm)] border border-line px-3 py-1.5 text-sm font-semibold transition hover:border-cacao"
                  >
                    Ouvrir la fiche
                  </Link>
                </li>
              ))}
            </ul>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-line">
                    <th scope="col" className="p-4 pb-3 text-sm font-semibold">
                      Date
                    </th>
                    <th scope="col" className="p-4 pb-3 text-sm font-semibold">
                      Cliente
                    </th>
                    <th scope="col" className="p-4 pb-3 text-sm font-semibold">
                      Prestation
                    </th>
                    <th scope="col" className="p-4 pb-3 text-sm font-semibold">
                      Durée
                    </th>
                    <th scope="col" className="p-4 pb-3 text-sm font-semibold">
                      Prix
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
                  {result.items.map((appointment) => (
                    <tr key={appointment.id} className="border-b border-line">
                      <td className="p-4 text-sm">
                        <LocalDateTime iso={appointment.startsAt.toISOString()} />
                      </td>
                      <td className="p-4">
                        <p className="font-semibold">{appointment.customerName}</p>
                        <p className="text-xs text-muted">{appointment.customerEmail}</p>
                      </td>
                      <td className="p-4 text-sm">{appointment.serviceName}</td>
                      <td className="p-4 text-sm">{appointment.durationMinutes} min</td>
                      <td className="p-4 text-sm">
                        {appointment.priceCents == null
                          ? 'À confirmer'
                          : euroFormatter.format(appointment.priceCents / 100)}
                      </td>
                      <td className="p-4">
                        <Badge tone={APPOINTMENT_STATUS_TONES[appointment.status]}>
                          {APPOINTMENT_STATUS_LABELS[appointment.status]}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/dashboard/reservations/${appointment.id}`}
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
          aria-label="Pagination des réservations"
          className="mt-4 flex flex-wrap items-center justify-between gap-3"
        >
          {result.page > 1 ? (
            <Link
              href={pageHref(status, result.page - 1, all)}
              rel="prev"
              className="rounded-[var(--radius-md)] border border-line bg-card px-4 py-2 text-sm font-semibold transition hover:border-cacao"
            >
              Page précédente
            </Link>
          ) : (
            <span className="text-sm text-muted">Page précédente</span>
          )}
          <p className="text-sm text-muted">
            Page {result.page} sur {result.totalPages} · {result.total} rendez-vous
          </p>
          {result.page < result.totalPages ? (
            <Link
              href={pageHref(status, result.page + 1, all)}
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

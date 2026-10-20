import {
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import type { AppointmentStatus } from '@prisma/client';
import { requireAdmin } from '@/modules/auth/guards';
import { countAppointmentsByStatus, listAppointmentsAdmin } from '@/modules/reservations/queries';
import { formatDuration, formatFcfaOrPending } from '@/modules/reservations/format';
import {
  APPOINTMENT_STATUS_SHORT_LABELS,
  APPOINTMENT_STATUS_TONES,
} from '@/modules/reservations/status';
import { PageHeader } from '@/components/layout/PageHeader';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import { EmptyState } from '@/components/shared/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { CardLink } from '@/components/ui/Card';

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
  // Un filtre de statut (terminées, annulées…) porte sur tout l'historique.
  const all = firstValue(params.all) === '1' || Boolean(status);
  const rawPage = Number.parseInt(firstValue(params.page), 10);
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const [counts, result] = await Promise.all([
    countAppointmentsByStatus(),
    listAppointmentsAdmin({ status: status || undefined, page, upcomingOnly: !all }),
  ]);
  const totalCount = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <div>
      <PageHeader
        icon={ClipboardList}
        title="Réservations"
        description="Rendez-vous à venir et historique. Touchez une réservation pour la gérer."
        actions={
          <ButtonLink
            href="/dashboard/calendrier"
            variant="secondary"
            icon={CalendarDays}
            iconOnly="mobile"
          >
            Calendrier
          </ButtonLink>
        }
      />

      <nav
        aria-label="Filtres des réservations"
        className="-mx-3 mb-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
      >
        <ButtonLink
          href={pageHref('', 1, false)}
          size="sm"
          variant={!all ? 'primary' : 'secondary'}
          aria-current={!all ? 'page' : undefined}
        >
          À venir
        </ButtonLink>
        <ButtonLink
          href={pageHref('', 1, true)}
          size="sm"
          variant={!status && all ? 'primary' : 'secondary'}
          aria-current={!status && all ? 'page' : undefined}
        >
          {`Tout (${totalCount})`}
        </ButtonLink>
        {STATUSES.map((item) => (
          <ButtonLink
            key={item}
            href={pageHref(item, 1, true)}
            size="sm"
            variant={status === item ? 'primary' : 'secondary'}
            aria-current={status === item ? 'page' : undefined}
          >
            {`${APPOINTMENT_STATUS_SHORT_LABELS[item]} (${counts[item] ?? 0})`}
          </ButtonLink>
        ))}
      </nav>

      {result.items.length === 0 ? (
        <EmptyState
          title="Aucune réservation"
          message={
            status || all
              ? 'Aucun rendez-vous ne correspond à ce filtre.'
              : 'Aucun rendez-vous à venir. Les nouvelles réservations apparaîtront ici.'
          }
        />
      ) : (
        <ul className="grid gap-2">
          {result.items.map((appointment) => (
            <li key={appointment.id}>
              <CardLink
                href={`/dashboard/reservations/${appointment.id}`}
                label={`Réservation de ${appointment.customerName}, ${appointment.serviceName}`}
              >
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-fg">{appointment.customerName}</p>
                    <p className="truncate text-sm text-muted">
                      {appointment.serviceName} · {formatDuration(appointment.durationMinutes)} ·{' '}
                      {formatFcfaOrPending(appointment.priceCents)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end">
                    <span className="flex items-center gap-1.5 text-sm text-muted">
                      <CalendarClock aria-hidden="true" className="size-4 text-accent" />
                      <LocalDateTime
                        iso={appointment.startsAt.toISOString()}
                        dateStyle="medium"
                        timeStyle="short"
                      />
                    </span>
                    <Badge tone={APPOINTMENT_STATUS_TONES[appointment.status]}>
                      {APPOINTMENT_STATUS_SHORT_LABELS[appointment.status]}
                    </Badge>
                  </div>
                </div>
              </CardLink>
            </li>
          ))}
        </ul>
      )}

      {result.totalPages > 1 ? (
        <nav
          aria-label="Pagination des réservations"
          className="mt-4 flex items-center justify-between gap-3"
        >
          {result.page > 1 ? (
            <ButtonLink
              href={pageHref(status, result.page - 1, all)}
              rel="prev"
              variant="secondary"
              size="sm"
              icon={ChevronLeft}
              iconOnly="mobile"
            >
              Page précédente
            </ButtonLink>
          ) : (
            <span aria-hidden="true" className="size-9" />
          )}
          <p className="text-center text-sm text-muted">
            Page {result.page} sur {result.totalPages} · {result.total} rendez-vous
          </p>
          {result.page < result.totalPages ? (
            <ButtonLink
              href={pageHref(status, result.page + 1, all)}
              rel="next"
              variant="secondary"
              size="sm"
              icon={ChevronRight}
              iconOnly="mobile"
            >
              Page suivante
            </ButtonLink>
          ) : (
            <span aria-hidden="true" className="size-9" />
          )}
        </nav>
      ) : null}
    </div>
  );
}

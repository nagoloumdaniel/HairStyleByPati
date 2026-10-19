import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { getAppointmentDetail } from '@/modules/reservations/queries';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_TONES } from '@/modules/reservations/status';
import { bookingReference } from '@/modules/reservations/schemas';
import { listAuditLogsForEntity } from '@/modules/stats/audit';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { AppointmentActions } from './appointment-actions';

export const metadata: Metadata = { title: 'Rendez-vous - Tableau de bord' };

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const ACTION_LABELS: Record<string, string> = {
  'appointment.create': 'Réservation créée',
  'appointment.confirmed': 'Rendez-vous confirmé',
  'appointment.completed': 'Rendez-vous terminé',
  'appointment.no_show': 'Cliente absente',
  'appointment.cancel_admin': 'Annulation par le salon',
  'appointment.cancel_customer': 'Annulation par la cliente',
  'appointment.reschedule': 'Reprogrammation',
  'appointment.auto_expire': 'Libération automatique du créneau',
};

function formatAnswer(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(', ');
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (value == null || value === '') return 'Non renseigné';
  return String(value);
}

export default async function AppointmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  if (!user) redirect(`/connexion?callbackUrl=/dashboard/reservations/${id}`);

  const appointment = await getAppointmentDetail(id);
  if (!appointment) notFound();
  const history = await listAuditLogsForEntity('Appointment', appointment.id);

  return (
    <div className="p-6">
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/dashboard/reservations" className="transition hover:text-cacao">
              Réservations
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="font-medium text-fg">
              {bookingReference(appointment.id)}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">
              Rendez-vous {bookingReference(appointment.id)}
            </h1>
            <Badge tone={APPOINTMENT_STATUS_TONES[appointment.status]}>
              {APPOINTMENT_STATUS_LABELS[appointment.status]}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted">
            <LocalDateTime iso={appointment.startsAt.toISOString()} /> · {appointment.service.name}{' '}
            · {appointment.durationMinutes} min
          </p>
          {appointment.holdExpiresAt ? (
            <p className="mt-1 text-sm text-cacao">
              Créneau réservé temporairement jusqu’à{' '}
              <LocalDateTime iso={appointment.holdExpiresAt.toISOString()} timeStyle="short" />.
            </p>
          ) : null}
        </div>
        <Link
          href="/dashboard/calendrier"
          className="rounded-[var(--radius-md)] border border-line bg-card px-4 py-2 text-sm font-semibold transition hover:border-cacao"
        >
          Voir le calendrier
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <h2 className="font-heading text-xl font-bold text-fg">Cliente</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex flex-wrap gap-2">
                <dt className="font-semibold">Nom :</dt>
                <dd>{appointment.customer.name}</dd>
              </div>
              <div className="flex flex-wrap gap-2">
                <dt className="font-semibold">E-mail :</dt>
                <dd>
                  <a
                    href={`mailto:${appointment.customer.email}`}
                    className="text-cacao underline-offset-4 hover:underline"
                  >
                    {appointment.customer.email}
                  </a>
                </dd>
              </div>
              <div className="flex flex-wrap gap-2">
                <dt className="font-semibold">Téléphone :</dt>
                <dd>
                  <a
                    href={`tel:${appointment.customer.phone.replace(/\s+/g, '')}`}
                    className="text-cacao underline-offset-4 hover:underline"
                  >
                    {appointment.customer.phone}
                  </a>
                </dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h2 className="font-heading text-xl font-bold text-fg">Réservation</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-semibold">Prestation</dt>
                <dd className="text-muted">{appointment.service.name}</dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-semibold">Prix figé</dt>
                <dd className="text-muted">
                  {appointment.priceCents == null
                    ? 'À confirmer'
                    : euroFormatter.format(appointment.priceCents / 100)}
                </dd>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                <dt className="font-semibold">Durée figée</dt>
                <dd className="text-muted">{appointment.durationMinutes} minutes</dd>
              </div>
              {appointment.selectedOptions.length > 0 ? (
                <div>
                  <dt className="font-semibold">Options</dt>
                  <dd className="mt-1 space-y-1 text-muted">
                    {appointment.selectedOptions.map((option) => (
                      <p key={option.optionId}>
                        {option.name} (+{euroFormatter.format(option.priceCents / 100)})
                      </p>
                    ))}
                  </dd>
                </div>
              ) : null}
              {appointment.comments ? (
                <div>
                  <dt className="font-semibold">Commentaire</dt>
                  <dd className="mt-1 whitespace-pre-line text-muted">{appointment.comments}</dd>
                </div>
              ) : null}
              {appointment.rescheduledFrom ? (
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="font-semibold">Ancien créneau</dt>
                  <dd className="text-muted">
                    <LocalDateTime iso={appointment.rescheduledFrom.toISOString()} />
                  </dd>
                </div>
              ) : null}
              {appointment.cancelledAt ? (
                <div className="rounded-[var(--radius-sm)] bg-alert-soft px-3 py-2 text-alert">
                  Annulé le <LocalDateTime iso={appointment.cancelledAt.toISOString()} />
                  {appointment.cancelReason ? ` · Motif : ${appointment.cancelReason}` : ''}
                </div>
              ) : null}
            </dl>
            {appointment.cancelToken ? (
              <p className="mt-3 text-sm">
                Lien client d’annulation :{' '}
                <Link
                  href={`/annulation/${appointment.cancelToken}`}
                  className="font-semibold text-cacao underline-offset-4 hover:underline"
                >
                  /annulation/{appointment.cancelToken.slice(0, 8)}…
                </Link>
              </p>
            ) : null}
          </Card>

          <Card>
            <h2 className="font-heading text-xl font-bold text-fg">Informations capillaires</h2>
            {Object.keys(appointment.hairInfo).length === 0 ? (
              <p className="mt-2 text-sm text-muted">Aucune réponse enregistrée.</p>
            ) : (
              <dl className="mt-3 divide-y divide-line text-sm">
                {Object.entries(appointment.hairInfo).map(([key, value]) => (
                  <div key={key} className="flex flex-wrap justify-between gap-2 py-2">
                    <dt className="font-semibold text-fg">{key}</dt>
                    <dd className="text-muted">{formatAnswer(value)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-heading text-xl font-bold text-fg">Actions</h2>
            <div className="mt-3">
              <AppointmentActions appointmentId={appointment.id} status={appointment.status} />
            </div>
          </Card>

          <Card>
            <h2 className="font-heading text-xl font-bold text-fg">Historique</h2>
            {history.length === 0 ? (
              <p className="mt-2 text-sm text-muted">Aucune action enregistrée.</p>
            ) : (
              <ol className="mt-3 space-y-3">
                {history.map((entry) => (
                  <li key={entry.id} className="border-b border-line pb-3 last:border-0">
                    <p className="text-sm font-semibold text-fg">
                      {ACTION_LABELS[entry.action] ?? entry.action}
                    </p>
                    <p className="text-xs text-muted">
                      <LocalDateTime iso={entry.createdAt.toISOString()} />
                      {entry.userName ? ` · ${entry.userName}` : ''}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

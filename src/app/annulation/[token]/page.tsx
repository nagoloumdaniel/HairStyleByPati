import type { Metadata } from 'next';
import Link from 'next/link';
import { getAppointmentByCancelToken } from '@/modules/reservations/queries';
import {
  evaluateCancellationPolicy,
  isCancellationTokenValid,
} from '@/modules/reservations/policy';
import {
  APPOINTMENT_STATUS_LABELS,
  isActiveAppointmentStatus,
} from '@/modules/reservations/status';
import { getSalonSettings } from '@/modules/disponibilites/queries';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import { Badge } from '@/components/ui/Badge';
import { CancelForm } from './cancel-form';
import { Title } from '@/components/ui/Title';

export const metadata: Metadata = {
  title: 'Gérer mon rendez-vous',
  robots: { index: false, follow: false },
};

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'XOF',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export default async function AnnulationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const appointment = await getAppointmentByCancelToken(token);

  if (!appointment) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-[var(--radius-lg)] border border-alert bg-alert-soft p-8 text-center">
          <h1 className="font-heading text-2xl font-bold text-alert">Lien d’annulation invalide</h1>
          <p className="mt-3 text-fg">
            Ce lien ne correspond à aucun rendez-vous. Vérifiez le lien reçu ou contactez le salon.
          </p>
          <Link
            href="/contact"
            className="mt-6 inline-flex rounded-[var(--radius-md)] bg-accent px-5 py-2.5 font-semibold text-accent-fg"
          >
            Contacter le salon
          </Link>
        </div>
      </main>
    );
  }

  const settings = await getSalonSettings();
  const now = new Date();
  const tokenValid = isCancellationTokenValid(appointment.cancelTokenExpiresAt, now);
  const active = isActiveAppointmentStatus(appointment.status);
  const policy = evaluateCancellationPolicy({
    startsAt: appointment.startsAt,
    now,
    minCancelNoticeHours: settings.minCancelNoticeHours,
  });

  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10 sm:px-6 md:py-14">
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
              Mon rendez-vous
            </span>
          </li>
        </ol>
      </nav>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="neutral">{appointment.service.name}</Badge>
          <Badge tone={active ? 'success' : 'alert'}>
            {APPOINTMENT_STATUS_LABELS[appointment.status] ?? appointment.status}
          </Badge>
        </div>
        <Title as="h1" size="display" className="">
          Gérer mon rendez-vous
        </Title>
        <p className="text-lg text-muted">
          Retrouvez ici les informations de votre rendez-vous et les conditions d’annulation.
        </p>
      </header>

      <section className="rounded-[var(--radius-lg)] border border-line bg-card p-6 shadow-soft">
        <dl className="space-y-3 text-sm">
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="font-semibold text-fg">Date et heure</dt>
            <dd className="text-muted">
              <LocalDateTime iso={appointment.startsAt.toISOString()} />
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="font-semibold text-fg">Durée</dt>
            <dd className="text-muted">{appointment.durationMinutes} minutes</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="font-semibold text-fg">Prix</dt>
            <dd className="text-muted">
              {appointment.priceCents == null
                ? 'Prix à confirmer'
                : euroFormatter.format(appointment.priceCents / 100)}
            </dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="font-semibold text-fg">Cliente</dt>
            <dd className="text-muted">{appointment.customer.name}</dd>
          </div>
          <div className="flex flex-wrap justify-between gap-2">
            <dt className="font-semibold text-fg">Paiement</dt>
            <dd className="text-muted">Sur place</dd>
          </div>
        </dl>
      </section>

      {!tokenValid ? (
        <section className="rounded-[var(--radius-lg)] border border-alert bg-alert-soft p-6">
          <h2 className="font-heading text-xl font-bold text-alert">Lien expiré</h2>
          <p className="mt-2 text-fg">
            Ce lien d’annulation n’est plus valide. Contactez le salon pour toute modification.
          </p>
        </section>
      ) : !active ? (
        <section className="rounded-[var(--radius-lg)] border border-line bg-page p-6">
          <Title as="h2" className="">
            Ce rendez-vous n’est plus actif
          </Title>
          <p className="mt-2 text-muted">
            Statut actuel : {APPOINTMENT_STATUS_LABELS[appointment.status] ?? appointment.status}.
            {appointment.cancelReason ? ` Motif : ${appointment.cancelReason}.` : ''}
          </p>
        </section>
      ) : !policy.allowed ? (
        <section className="rounded-[var(--radius-lg)] border border-alert bg-alert-soft p-6">
          <h2 className="font-heading text-xl font-bold text-alert">
            Annulation en ligne indisponible
          </h2>
          <p className="mt-2 text-fg">{policy.message}</p>
          <Link
            href="/contact"
            className="mt-5 inline-flex rounded-[var(--radius-md)] bg-accent px-5 py-2.5 font-semibold text-accent-fg"
          >
            Contacter le salon
          </Link>
        </section>
      ) : (
        <section className="rounded-[var(--radius-lg)] border border-line bg-card p-6 shadow-soft">
          <Title as="h2" className="">
            Annuler ce rendez-vous
          </Title>
          <p className="mt-2 text-sm text-muted">{policy.message}</p>
          <div className="mt-4">
            <CancelForm token={token} reasonRequired={settings.cancelReasonRequired} />
          </div>
        </section>
      )}
    </main>
  );
}

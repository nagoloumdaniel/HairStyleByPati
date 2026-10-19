import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { logout } from '@/modules/auth/actions';
import { getDashboardOverview, getStatistics } from '@/modules/stats/overview';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_TONES } from '@/modules/reservations/status';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export const metadata: Metadata = {
  title: 'Tableau de bord - Hairstyle by Patricia',
};

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 2,
});

export default async function DashboardPage() {
  // P1.8 : garde serveur en plus du middleware (défense en profondeur)
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard');

  const [overview, stats] = await Promise.all([getDashboardOverview(), getStatistics()]);

  const indicators = [
    {
      label: 'Rendez-vous aujourd’hui',
      value: overview.todayAppointments,
      href: '/dashboard/calendrier',
      tone: 'accent' as const,
    },
    {
      label: 'En attente de confirmation',
      value: overview.pendingAppointments,
      href: '/dashboard/reservations?status=PENDING',
      tone: overview.pendingAppointments > 0 ? ('alert' as const) : ('neutral' as const),
    },
    {
      label: 'Nouvelles demandes',
      value: overview.newCustomRequests,
      href: '/dashboard/demandes?status=NEW',
      tone: overview.newCustomRequests > 0 ? ('accent' as const) : ('neutral' as const),
    },
    {
      label: 'Évaluations à traiter',
      value: overview.pendingAssessments,
      href: '/dashboard/evaluations',
      tone: overview.pendingAssessments > 0 ? ('alert' as const) : ('neutral' as const),
    },
    {
      label: 'Messages non lus',
      value: overview.unreadMessages,
      href: '/dashboard/messages',
      tone: overview.unreadMessages > 0 ? ('accent' as const) : ('neutral' as const),
    },
    {
      label: 'Notifications non lues',
      value: overview.unreadNotifications,
      href: '/dashboard/notifications',
      tone: overview.unreadNotifications > 0 ? ('accent' as const) : ('neutral' as const),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">Bonjour {user.name}</h1>
          <p className="mt-1 text-ink-soft">
            Vue d’ensemble du salon, des rendez-vous et des demandes en cours.
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="secondary" size="sm">
            Se déconnecter
          </Button>
        </form>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {indicators.map((indicator) => (
          <Link
            key={indicator.label}
            href={indicator.href}
            className="rounded-[var(--radius-lg)] border border-line bg-card p-4 shadow-soft transition hover:border-cacao"
          >
            <p className="text-sm text-ink-soft">{indicator.label}</p>
            <p className="mt-1 font-heading text-3xl font-bold text-fg">{indicator.value}</p>
            <span className="mt-2 inline-block">
              <Badge tone={indicator.tone}>Voir</Badge>
            </span>
          </Link>
        ))}
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-heading text-xl font-bold text-fg">Prochains rendez-vous</h2>
            <Link
              href="/dashboard/calendrier"
              className="text-sm font-semibold text-cacao hover:underline"
            >
              Calendrier
            </Link>
          </div>
          {overview.upcoming.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">Aucun rendez-vous à venir.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {overview.upcoming.map((appointment) => (
                <li key={appointment.id} className="py-2">
                  <Link
                    href={`/dashboard/reservations/${appointment.id}`}
                    className="flex flex-wrap items-center justify-between gap-2"
                  >
                    <span className="text-sm font-semibold text-fg">
                      {appointment.customerName} · {appointment.serviceName}
                    </span>
                    <Badge
                      tone={APPOINTMENT_STATUS_TONES[appointment.status as never] ?? 'neutral'}
                    >
                      {APPOINTMENT_STATUS_LABELS[appointment.status as never] ?? appointment.status}
                    </Badge>
                  </Link>
                  <p className="text-xs text-ink-soft">
                    <LocalDateTime iso={appointment.startsAt.toISOString()} />
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-heading text-xl font-bold text-fg">Indicateurs</h2>
            <Link
              href="/dashboard/statistiques"
              className="text-sm font-semibold text-cacao hover:underline"
            >
              Statistiques
            </Link>
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-ink-soft">Rendez-vous au total</dt>
              <dd className="font-semibold text-fg">{stats.totalAppointments}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Annulations récentes</dt>
              <dd className="font-semibold text-fg">{overview.recentCancellations}</dd>
            </div>
            <div>
              <dt className="text-ink-soft">Prestations terminées</dt>
              <dd className="font-semibold text-fg">
                {stats.byStatus.find((row) => row.status === 'COMPLETED')?.count ?? 0}
              </dd>
            </div>
            <div>
              <dt className="text-ink-soft">Revenus estimés</dt>
              <dd className="font-semibold text-fg">
                {euroFormatter.format(stats.completedRevenueCents / 100)}
              </dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-ink-soft">
            Revenus estimés = prix figés des rendez-vous terminés. Les statistiques détaillées sont
            disponibles dans le module Statistiques.
          </p>
        </Card>

        <Card>
          <h2 className="font-heading text-xl font-bold text-fg">Prochaines indisponibilités</h2>
          {overview.nextBlocked.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">Aucune indisponibilité à venir.</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {overview.nextBlocked.map((block) => (
                <li key={block.id} className="py-2 text-sm">
                  <p className="font-semibold text-fg">
                    <LocalDateTime iso={block.startsAt.toISOString()} /> →{' '}
                    <LocalDateTime iso={block.endsAt.toISOString()} />
                  </p>
                  <p className="text-xs text-ink-soft">{block.reason ?? 'Sans motif'}</p>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <h2 className="font-heading text-xl font-bold text-fg">Annulations récentes</h2>
          {overview.recentCancelled.length === 0 ? (
            <p className="mt-2 text-sm text-ink-soft">
              Aucune annulation sur les 7 derniers jours.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {overview.recentCancelled.map((appointment) => (
                <li key={appointment.id} className="py-2">
                  <Link
                    href={`/dashboard/reservations/${appointment.id}`}
                    className="text-sm font-semibold text-fg hover:text-cacao"
                  >
                    {appointment.customerName} · {appointment.serviceName}
                  </Link>
                  <p className="text-xs text-ink-soft">
                    Annulé le <LocalDateTime iso={appointment.cancelledAt?.toISOString() ?? ''} />
                  </p>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

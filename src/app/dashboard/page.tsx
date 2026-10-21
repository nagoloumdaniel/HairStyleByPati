import {
  ArrowRight,
  Bell,
  CalendarCheck,
  CalendarClock,
  CalendarOff,
  ChartNoAxesColumn,
  ChevronRight,
  ClipboardCheck,
  Hourglass,
  LayoutDashboard,
  MessageSquare,
  Wand2,
  XCircle,
} from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense, type ReactNode } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import { Skeleton } from '@/components/shared/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Card, CardLink } from '@/components/ui/Card';
import { requireAdmin } from '@/modules/auth/guards';
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_TONES } from '@/modules/reservations/status';
import { formatFcfa } from '@/modules/stats/format';
import { getDashboardOverview, getSummaryStatistics } from '@/modules/stats/overview';

export const metadata: Metadata = {
  title: 'Tableau de bord - Hairstyle by Patricia',
};

/* Ligne de liste entièrement cliquable (aucun bouton « Voir »). */
const ROW =
  '-mx-2 flex items-center justify-between gap-2 rounded-[var(--radius-md)] px-2 py-2 transition hover:bg-accent-soft focus-visible:bg-accent-soft';

function CardTitle({ icon: Icon, children }: { icon: typeof Bell; children: ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-fg">
      <Icon aria-hidden="true" className="size-5 text-accent" />
      {children}
    </h2>
  );
}

async function HomeContent() {
  const [overview, summary] = await Promise.all([getDashboardOverview(), getSummaryStatistics()]);

  const indicators = [
    {
      label: 'Rendez-vous aujourd’hui',
      icon: CalendarCheck,
      value: overview.todayAppointments,
      href: '/dashboard/calendrier',
    },
    {
      label: 'En attente de confirmation',
      icon: Hourglass,
      value: overview.pendingAppointments,
      href: '/dashboard/reservations?status=PENDING',
    },
    {
      label: 'Nouvelles demandes',
      icon: Wand2,
      value: overview.newCustomRequests,
      href: '/dashboard/demandes?status=NEW',
    },
    {
      label: 'Évaluations à traiter',
      icon: ClipboardCheck,
      value: overview.pendingAssessments,
      href: '/dashboard/evaluations',
    },
    {
      label: 'Messages non lus',
      icon: MessageSquare,
      value: overview.unreadMessages,
      href: '/dashboard/messages',
    },
    {
      label: 'Notifications non lues',
      icon: Bell,
      value: overview.unreadNotifications,
      href: '/dashboard/notifications',
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {indicators.map((indicator) => (
          <CardLink key={indicator.label} href={indicator.href} className="p-3! sm:p-4!">
            <p className="flex items-center gap-1.5 text-sm text-muted">
              <indicator.icon aria-hidden="true" className="size-4 shrink-0 text-accent" />
              <span className="truncate">{indicator.label}</span>
            </p>
            <p className="mt-1 font-heading text-2xl font-bold text-fg sm:text-3xl">
              {indicator.value}
            </p>
          </CardLink>
        ))}
      </div>

      <div className="grid grid-cols-1 items-start gap-3 xl:grid-cols-2">
        <Card>
          <CardTitle icon={CalendarClock}>Prochains rendez-vous</CardTitle>
          {overview.upcoming.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Aucun rendez-vous à venir.</p>
          ) : (
            <ul className="mt-2">
              {overview.upcoming.map((appointment) => (
                <li key={appointment.id}>
                  <Link href={`/dashboard/reservations/${appointment.id}`} className={ROW}>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-fg">
                        {appointment.customerName} · {appointment.serviceName}
                      </span>
                      <span className="block text-xs text-muted">
                        <LocalDateTime
                          iso={appointment.startsAt.toISOString()}
                          dateStyle="medium"
                        />
                      </span>
                    </span>
                    <span className="flex shrink-0 items-center gap-1">
                      <Badge
                        tone={APPOINTMENT_STATUS_TONES[appointment.status as never] ?? 'neutral'}
                        className="px-2! py-0.5! text-xs!"
                      >
                        {APPOINTMENT_STATUS_LABELS[appointment.status as never] ??
                          appointment.status}
                      </Badge>
                      <ChevronRight aria-hidden="true" className="size-4 text-muted" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Carte entière cliquable vers les statistiques. */}
        <CardLink href="/dashboard/statistiques">
          <CardTitle icon={ChartNoAxesColumn}>Indicateurs</CardTitle>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted">Rendez-vous au total</dt>
              <dd className="font-semibold text-fg">{summary.totalAppointments}</dd>
            </div>
            <div>
              <dt className="text-muted">Annulations (7 jours)</dt>
              <dd className="font-semibold text-fg">{overview.recentCancellations}</dd>
            </div>
            <div>
              <dt className="text-muted">Prestations terminées</dt>
              <dd className="font-semibold text-fg">{summary.completedCount}</dd>
            </div>
            <div>
              <dt className="text-muted">Revenus estimés</dt>
              <dd className="font-semibold text-fg">{formatFcfa(summary.completedRevenueCents)}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-muted">Revenus = prix figés des rendez-vous terminés.</p>
        </CardLink>

        <Card>
          <CardTitle icon={CalendarOff}>Prochaines indisponibilités</CardTitle>
          {overview.nextBlocked.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Aucune indisponibilité à venir.</p>
          ) : (
            <ul className="mt-2">
              {overview.nextBlocked.map((block) => (
                <li key={block.id}>
                  <Link href="/dashboard/disponibilites" className={ROW}>
                    <span className="min-w-0 text-sm">
                      <span className="block font-semibold text-fg">
                        <LocalDateTime iso={block.startsAt.toISOString()} dateStyle="medium" />{' '}
                        <ArrowRight aria-hidden="true" className="inline size-3.5" />{' '}
                        <LocalDateTime iso={block.endsAt.toISOString()} dateStyle="medium" />
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {block.reason ?? 'Sans motif'}
                      </span>
                    </span>
                    <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardTitle icon={XCircle}>Annulations récentes</CardTitle>
          {overview.recentCancelled.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Aucune annulation sur les 7 derniers jours.</p>
          ) : (
            <ul className="mt-2">
              {overview.recentCancelled.map((appointment) => (
                <li key={appointment.id}>
                  <Link href={`/dashboard/reservations/${appointment.id}`} className={ROW}>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-fg">
                        {appointment.customerName} · {appointment.serviceName}
                      </span>
                      <span className="block text-xs text-muted">
                        Annulé le{' '}
                        {appointment.cancelledAt ? (
                          <LocalDateTime
                            iso={appointment.cancelledAt.toISOString()}
                            dateStyle="medium"
                          />
                        ) : (
                          'date inconnue'
                        )}
                      </span>
                    </span>
                    <ChevronRight aria-hidden="true" className="size-4 shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-19 w-full" />
        ))}
      </div>
      <div className="grid gap-3 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-40 w-full" />
        ))}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  // P1.8 : garde serveur en plus du middleware (défense en profondeur)
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard');

  return (
    <div>
      <PageHeader
        icon={LayoutDashboard}
        title={`Bonjour ${user.name}`}
        description="Vue d’ensemble des rendez-vous et des demandes en cours."
      />
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}

import { db } from '@/lib/db';
import { deviceTimeToUtc } from '@/lib/dates';

/* ============================================================
 * P8.5 / P8.6 : indicateurs du tableau de bord.
 * Définitions :
 * - rendez-vous du jour : créneaux dont le début est dans la journée
 *   locale Africa/Dakar ;
 * - revenus estimés : somme des prix figés des rendez-vous terminés ;
 * - annulations récentes : annulations client ou admin sur 7 jours ;
 * - taux de remplissage : non calculé dans cette version, voir ROADMAP.
 * ============================================================ */

const SALON_TZ = 'Africa/Dakar';
const ACTIVE_STATUSES = ['PENDING', 'CONFIRMED', 'RESCHEDULED'] as const;

function parisDateISO(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: SALON_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function salonDayBounds(now = new Date()): { start: Date; end: Date } {
  const dateISO = parisDateISO(now);
  const start = deviceTimeToUtc(dateISO, 0, SALON_TZ);
  const end = new Date(start.getTime() + 24 * 3_600_000);
  return { start, end };
}

export interface DashboardOverview {
  todayAppointments: number;
  pendingAppointments: number;
  activeUpcoming: number;
  newCustomRequests: number;
  pendingAssessments: number;
  unreadMessages: number;
  unreadNotifications: number;
  recentCancellations: number;
  upcoming: Array<{
    id: string;
    startsAt: Date;
    customerName: string;
    serviceName: string;
    status: string;
  }>;
  nextBlocked: Array<{ id: string; startsAt: Date; endsAt: Date; reason: string | null }>;
  recentCancelled: Array<{
    id: string;
    startsAt: Date;
    customerName: string;
    serviceName: string;
    status: string;
    cancelledAt: Date | null;
  }>;
}

export async function getDashboardOverview(now = new Date()): Promise<DashboardOverview> {
  const { start, end } = salonDayBounds(now);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 3_600_000);

  const [
    todayAppointments,
    pendingAppointments,
    activeUpcoming,
    newCustomRequests,
    pendingAssessments,
    unreadMessages,
    unreadNotifications,
    recentCancellations,
    upcomingRows,
    blockedRows,
    cancelledRows,
  ] = await Promise.all([
    db.appointment.count({ where: { startsAt: { gte: start, lt: end } } }),
    db.appointment.count({ where: { status: 'PENDING' } }),
    db.appointment.count({
      where: { status: { in: [...ACTIVE_STATUSES] }, startsAt: { gte: now } },
    }),
    db.customRequest.count({ where: { status: 'NEW' } }),
    db.hairAssessment.count({ where: { status: { in: ['RECEIVED', 'IN_PROGRESS'] } } }),
    db.message.count({ where: { author: 'CUSTOMER', isInternal: false, readAt: null } }),
    db.notification.count({ where: { channel: 'IN_APP', readAt: null } }),
    db.appointment.count({
      where: {
        status: { in: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'] },
        cancelledAt: { gte: weekAgo },
      },
    }),
    db.appointment.findMany({
      where: { status: { in: [...ACTIVE_STATUSES] }, startsAt: { gte: now } },
      orderBy: { startsAt: 'asc' },
      take: 6,
      select: {
        id: true,
        startsAt: true,
        status: true,
        customer: { select: { name: true } },
        service: { select: { name: true } },
      },
    }),
    db.blockedPeriod.findMany({
      where: { endsAt: { gte: now } },
      orderBy: { startsAt: 'asc' },
      take: 3,
    }),
    db.appointment.findMany({
      where: {
        status: { in: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'] },
        cancelledAt: { gte: weekAgo },
      },
      orderBy: { cancelledAt: 'desc' },
      take: 5,
      select: {
        id: true,
        startsAt: true,
        status: true,
        cancelledAt: true,
        customer: { select: { name: true } },
        service: { select: { name: true } },
      },
    }),
  ]);

  return {
    todayAppointments,
    pendingAppointments,
    activeUpcoming,
    newCustomRequests,
    pendingAssessments,
    unreadMessages,
    unreadNotifications,
    recentCancellations,
    upcoming: upcomingRows.map((row) => ({
      id: row.id,
      startsAt: row.startsAt,
      status: row.status,
      customerName: row.customer.name,
      serviceName: row.service.name,
    })),
    nextBlocked: blockedRows.map((row) => ({
      id: row.id,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      reason: row.reason,
    })),
    recentCancelled: cancelledRows.map((row) => ({
      id: row.id,
      startsAt: row.startsAt,
      status: row.status,
      cancelledAt: row.cancelledAt,
      customerName: row.customer.name,
      serviceName: row.service.name,
    })),
  };
}

/* ============================================================
 * Statistiques (période) : tout est calculé sur les rendez-vous dont le début
 * tombe dans la période, en jour civil Africa/Dakar (UTC+0). Montants en 1/100 FCFA.
 * ============================================================ */

export const STATS_PERIODS = ['7', '30', '90', '365'] as const;
export type StatsPeriod = (typeof STATS_PERIODS)[number];

export function parseStatsPeriod(value: string | string[] | undefined): StatsPeriod {
  const v = Array.isArray(value) ? value[0] : value;
  return (STATS_PERIODS as readonly string[]).includes(v ?? '') ? (v as StatsPeriod) : '30';
}

export interface StatsBucket {
  key: string;
  /** Libellé court d'axe (ex. « 12 oct. »). */
  label: string;
  /** Libellé complet pour l'infobulle / le tableau. */
  tip: string;
  appointments: number;
  revenueCents: number;
}

export interface PeriodStatistics {
  period: StatsPeriod;
  granularity: 'day' | 'week' | 'month';
  totalAppointments: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  customRequests: number;
  revenueCents: number;
  averageTicketCents: number;
  byStatus: Array<{ status: string; count: number }>;
  popularServices: Array<{ name: string; count: number }>;
  series: StatsBucket[];
}

const DAY_MS = 24 * 3_600_000;
const labelFmt = new Intl.DateTimeFormat('fr-FR', {
  timeZone: SALON_TZ,
  day: 'numeric',
  month: 'short',
});
const tipFmt = new Intl.DateTimeFormat('fr-FR', {
  timeZone: SALON_TZ,
  weekday: 'short',
  day: 'numeric',
  month: 'long',
});
const monthFmt = new Intl.DateTimeFormat('fr-FR', {
  timeZone: SALON_TZ,
  month: 'short',
  year: '2-digit',
});
const monthLongFmt = new Intl.DateTimeFormat('fr-FR', {
  timeZone: SALON_TZ,
  month: 'long',
  year: 'numeric',
});

/** Prépare les intervalles du graphique et la fonction qui range un instant dans le bon. */
function buildBuckets(period: StatsPeriod, now: Date) {
  const { start: todayStart } = salonDayBounds(now);
  const buckets: StatsBucket[] = [];

  if (period === '365') {
    // 12 derniers mois civils, mois courant inclus (UTC = Dakar).
    const first = new Date(Date.UTC(todayStart.getUTCFullYear(), todayStart.getUTCMonth() - 11, 1));
    for (let i = 0; i < 12; i++) {
      const d = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + i, 1));
      buckets.push({
        key: d.toISOString().slice(0, 7),
        label: monthFmt.format(d),
        tip: monthLongFmt.format(d),
        appointments: 0,
        revenueCents: 0,
      });
    }
    return {
      from: first,
      granularity: 'month' as const,
      buckets,
      index: (t: Date) => buckets.findIndex((b) => b.key === t.toISOString().slice(0, 7)),
    };
  }

  const days = Number(period);
  const weekly = period === '90';
  const count = weekly ? 13 : days;
  const span = weekly ? 7 : 1;
  const from = new Date(todayStart.getTime() - (count * span - 1) * DAY_MS);
  for (let i = 0; i < count; i++) {
    const d = new Date(from.getTime() + i * span * DAY_MS);
    buckets.push({
      key: d.toISOString().slice(0, 10),
      label: labelFmt.format(d),
      tip: weekly ? `Semaine du ${labelFmt.format(d)}` : tipFmt.format(d),
      appointments: 0,
      revenueCents: 0,
    });
  }
  return {
    from,
    granularity: weekly ? ('week' as const) : ('day' as const),
    buckets,
    index: (t: Date) => Math.floor((t.getTime() - from.getTime()) / (span * DAY_MS)),
  };
}

export async function getPeriodStatistics(
  period: StatsPeriod,
  now = new Date(),
): Promise<PeriodStatistics> {
  const { from, granularity, buckets, index } = buildBuckets(period, now);
  const to = salonDayBounds(now).end;

  const [rows, customRequests] = await Promise.all([
    db.appointment.findMany({
      where: { startsAt: { gte: from, lt: to } },
      select: { startsAt: true, status: true, priceCents: true, serviceId: true },
      take: 20_000,
    }),
    db.customRequest.count({ where: { createdAt: { gte: from, lt: to } } }),
  ]);

  const statusCount = new Map<string, number>();
  const serviceCount = new Map<string, number>();
  let revenueCents = 0;
  let completedCount = 0;
  let pricedCompleted = 0;
  let cancelledCount = 0;
  let noShowCount = 0;

  for (const row of rows) {
    statusCount.set(row.status, (statusCount.get(row.status) ?? 0) + 1);
    const cancelled = row.status === 'CANCELLED_BY_CUSTOMER' || row.status === 'CANCELLED_BY_ADMIN';
    if (cancelled) cancelledCount++;
    if (row.status === 'NO_SHOW') noShowCount++;
    const bucket = buckets[index(row.startsAt)];
    if (bucket && !cancelled) bucket.appointments++;
    if (row.status === 'COMPLETED') {
      completedCount++;
      if (row.priceCents != null) {
        revenueCents += row.priceCents;
        pricedCompleted++;
        if (bucket) bucket.revenueCents += row.priceCents;
      }
    }
    if (['CONFIRMED', 'RESCHEDULED', 'COMPLETED'].includes(row.status)) {
      serviceCount.set(row.serviceId, (serviceCount.get(row.serviceId) ?? 0) + 1);
    }
  }

  const topServices = [...serviceCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  const services = topServices.length
    ? await db.service.findMany({
        where: { id: { in: topServices.map(([id]) => id) } },
        select: { id: true, name: true },
      })
    : [];
  const names = new Map(services.map((s) => [s.id, s.name]));

  return {
    period,
    granularity,
    totalAppointments: rows.length,
    completedCount,
    cancelledCount,
    noShowCount,
    customRequests,
    revenueCents,
    averageTicketCents: pricedCompleted > 0 ? Math.round(revenueCents / pricedCompleted) : 0,
    byStatus: [...statusCount.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count),
    popularServices: topServices.map(([id, count]) => ({
      name: names.get(id) ?? 'Prestation supprimée',
      count,
    })),
    series: buckets,
  };
}

/** Totaux depuis le début (accueil) : 2 requêtes seulement. */
export async function getSummaryStatistics() {
  const [totalAppointments, revenue] = await Promise.all([
    db.appointment.count(),
    db.appointment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { priceCents: true },
      _count: { _all: true },
    }),
  ]);
  return {
    totalAppointments,
    completedCount: revenue._count._all,
    completedRevenueCents: revenue._sum.priceCents ?? 0,
  };
}

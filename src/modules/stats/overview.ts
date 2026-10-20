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

export interface Statistics {
  totalAppointments: number;
  byStatus: Array<{ status: string; count: number }>;
  popularServices: Array<{ name: string; count: number }>;
  customRequests: number;
  completedRevenueCents: number;
  averageTicketCents: number;
}

export async function getStatistics(): Promise<Statistics> {
  const [totalAppointments, statusRows, serviceRows, customRequests, revenue] = await Promise.all([
    db.appointment.count(),
    db.appointment.groupBy({ by: ['status'], _count: { _all: true } }),
    db.appointment.groupBy({
      by: ['serviceId'],
      where: { status: { in: ['CONFIRMED', 'RESCHEDULED', 'COMPLETED'] } },
      _count: { _all: true },
      orderBy: { _count: { serviceId: 'desc' } },
      take: 8,
    }),
    db.customRequest.count(),
    db.appointment.aggregate({
      where: { status: 'COMPLETED', priceCents: { not: null } },
      _sum: { priceCents: true },
      _count: { _all: true },
    }),
  ]);

  const serviceIds = serviceRows.map((row) => row.serviceId);
  const services = serviceIds.length
    ? await db.service.findMany({
        where: { id: { in: serviceIds } },
        select: { id: true, name: true },
      })
    : [];
  const serviceNames = new Map(services.map((service) => [service.id, service.name]));
  const completedRevenueCents = revenue._sum.priceCents ?? 0;
  const completedCount = revenue._count._all;

  return {
    totalAppointments,
    byStatus: statusRows.map((row) => ({ status: row.status, count: row._count._all })),
    popularServices: serviceRows.map((row) => ({
      name: serviceNames.get(row.serviceId) ?? 'Prestation supprimée',
      count: row._count._all,
    })),
    customRequests,
    completedRevenueCents,
    averageTicketCents: completedCount > 0 ? Math.round(completedRevenueCents / completedCount) : 0,
  };
}

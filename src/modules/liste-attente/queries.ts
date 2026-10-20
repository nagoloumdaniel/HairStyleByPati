import type { WaitlistStatus } from '@prisma/client';
import { db } from '@/lib/db';

/* Lecture de la liste d'attente pour le dashboard. */

export const WAITLIST_STATUS_LABELS: Record<WaitlistStatus, string> = {
  WAITING: 'En attente',
  NOTIFIED: 'Prévenue',
  CONFIRMED: 'Confirmée',
  EXPIRED: 'Expirée',
  CANCELLED: 'Retirée',
};

export const WAITLIST_STATUS_TONES: Record<
  WaitlistStatus,
  'accent' | 'success' | 'alert' | 'neutral'
> = {
  WAITING: 'neutral',
  NOTIFIED: 'accent',
  CONFIRMED: 'success',
  EXPIRED: 'alert',
  CANCELLED: 'alert',
};

export async function listWaitlistEntries(options: { onlyOpen: boolean }) {
  const where = options.onlyOpen
    ? { status: { in: ['WAITING', 'NOTIFIED'] as WaitlistStatus[] } }
    : {};
  const [rows, grouped] = await Promise.all([
    db.waitlistEntry.findMany({
      where,
      orderBy: options.onlyOpen ? { desiredStartsAt: 'asc' } : { createdAt: 'desc' },
      take: 100,
      select: {
        id: true,
        status: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        desiredStartsAt: true,
        createdAt: true,
        service: { select: { name: true } },
      },
    }),
    db.waitlistEntry.groupBy({ by: ['status'], _count: { _all: true } }),
  ]);
  const counts = Object.fromEntries(grouped.map((g) => [g.status, g._count._all])) as Partial<
    Record<WaitlistStatus, number>
  >;
  return { rows, counts };
}

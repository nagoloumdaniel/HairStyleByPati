import { db } from '@/lib/db';

export async function getApprovedReviews(limit = 6) {
  return db.review.findMany({
    where: { status: 'APPROVED' },
    orderBy: { moderatedAt: 'desc' },
    take: limit,
    include: {
      customer: { select: { name: true } },
      service: { select: { name: true } },
    },
  });
}

export type ModerationFilter = 'SUBMITTED' | 'APPROVED' | 'REJECTED';

export const MODERATION_FILTERS: ModerationFilter[] = ['SUBMITTED', 'APPROVED', 'REJECTED'];

/* Avis soumis par les clientes, filtrés par statut de modération (plus anciens d'abord en attente). */
export async function listReviewsForModeration(status: ModerationFilter = 'SUBMITTED') {
  return db.review.findMany({
    where: { status },
    orderBy: status === 'SUBMITTED' ? { submittedAt: 'asc' } : { moderatedAt: 'desc' },
    take: 100,
    select: {
      id: true,
      rating: true,
      comment: true,
      status: true,
      submittedAt: true,
      moderatedAt: true,
      customer: { select: { id: true, name: true, email: true } },
      service: { select: { name: true } },
    },
  });
}

export async function countReviewsByStatus(): Promise<Record<ModerationFilter, number>> {
  const rows = await db.review.groupBy({
    by: ['status'],
    where: { status: { in: MODERATION_FILTERS } },
    _count: { _all: true },
  });
  const counts: Record<ModerationFilter, number> = { SUBMITTED: 0, APPROVED: 0, REJECTED: 0 };
  for (const row of rows) counts[row.status as ModerationFilter] = row._count._all;
  return counts;
}

export async function getReviewByToken(token: string) {
  return db.review.findUnique({
    where: { token },
    include: { service: { select: { name: true } } },
  });
}

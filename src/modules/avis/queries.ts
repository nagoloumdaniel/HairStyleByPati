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

export async function listReviewsForModeration() {
  return db.review.findMany({
    where: { status: 'SUBMITTED' },
    orderBy: { submittedAt: 'asc' },
    include: {
      customer: { select: { name: true, email: true } },
      service: { select: { name: true } },
    },
  });
}

export async function getReviewByToken(token: string) {
  return db.review.findUnique({
    where: { token },
    include: { service: { select: { name: true } } },
  });
}

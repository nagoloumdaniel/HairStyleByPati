import { db } from '@/lib/db';
import { findActivePromotion, type PromotionCandidate } from './pricing';

/* ============================================================
 * Lecture des promotions (P8.12)
 * ============================================================ */

export async function listPromotions() {
  return db.promotion.findMany({
    orderBy: { createdAt: 'desc' },
    include: { services: { include: { service: { select: { id: true, name: true } } } } },
  });
}

async function activePromotionCandidates(): Promise<PromotionCandidate[]> {
  const rows = await db.promotion.findMany({
    where: { active: true },
    include: { services: { select: { serviceId: true } } },
  });
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    kind: row.kind,
    value: row.value,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    active: row.active,
    serviceIds: row.services.map((s) => s.serviceId),
  }));
}

/** Promotion active pour une prestation à l'instant présent, ou null. */
export async function getActivePromotionForService(
  serviceId: string,
  now: Date = new Date(),
): Promise<PromotionCandidate | null> {
  const candidates = await activePromotionCandidates();
  return findActivePromotion(candidates, serviceId, now);
}

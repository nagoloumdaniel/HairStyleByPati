/* ============================================================
 * Moteur de promotions (P8.12) — fonctions pures, testables sans base.
 * Une promotion ne s'applique jamais au-delà de 100 % ni en dessous
 * de 0 : le prix réduit est toujours un entier positif ou nul.
 * ============================================================ */

export type PromotionKind = 'PERCENT' | 'FIXED';

export interface PromotionCandidate {
  id: string;
  name: string;
  kind: PromotionKind;
  value: number;
  startsAt: Date;
  endsAt: Date;
  active: boolean;
  serviceIds: string[];
}

export interface AppliedDiscount {
  promotionId: string;
  promotionName: string;
  discountCents: number;
  finalPriceCents: number;
}

/**
 * Choisit la promotion active pour une prestation à un instant donné.
 * S'il y en a plusieurs, la plus récemment créée (dernière de la liste
 * fournie, triée par l'appelant) l'emporte — un seul rabais à la fois.
 */
export function findActivePromotion(
  promotions: PromotionCandidate[],
  serviceId: string,
  now: Date,
): PromotionCandidate | null {
  const match = promotions.find(
    (promo) =>
      promo.active &&
      promo.serviceIds.includes(serviceId) &&
      promo.startsAt.getTime() <= now.getTime() &&
      promo.endsAt.getTime() >= now.getTime(),
  );
  return match ?? null;
}

/**
 * Applique le rabais d'une promotion à un prix en centimes.
 * Le prix final ne descend jamais sous 0, le rabais jamais au-delà du prix.
 */
export function applyPromotion(
  priceCents: number,
  promotion: Pick<PromotionCandidate, 'id' | 'name' | 'kind' | 'value'>,
): AppliedDiscount {
  const rawDiscount =
    promotion.kind === 'PERCENT'
      ? Math.round((priceCents * Math.min(100, Math.max(0, promotion.value))) / 100)
      : Math.max(0, promotion.value);
  const discountCents = Math.min(rawDiscount, Math.max(0, priceCents));
  return {
    promotionId: promotion.id,
    promotionName: promotion.name,
    discountCents,
    finalPriceCents: Math.max(0, priceCents - discountCents),
  };
}

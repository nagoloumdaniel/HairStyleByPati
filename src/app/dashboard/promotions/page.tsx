import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin } from '@/modules/auth/guards';
import { listPromotions } from '@/modules/promotions/queries';
import { PromotionsClient, type PromotionRow } from './promotions-client';

export const metadata: Metadata = { title: 'Promotions - Tableau de bord' };

const day = (date: Date) => date.toISOString().slice(0, 10);

export default async function PromotionsPage() {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/promotions');

  const [promotions, services] = await Promise.all([
    listPromotions(),
    db.service.findMany({
      select: { id: true, name: true, priceFromCents: true },
      orderBy: { name: 'asc' },
    }),
  ]);

  // Données minimales et sérialisables pour le client ; la phase est calculée côté serveur.
  const now = Date.now();
  const rows: PromotionRow[] = promotions.map((promotion) => ({
    id: promotion.id,
    name: promotion.name,
    code: promotion.code,
    kind: promotion.kind,
    value: promotion.value,
    startsAt: day(promotion.startsAt),
    endsAt: day(promotion.endsAt),
    active: promotion.active,
    phase: !promotion.active
      ? 'off'
      : promotion.endsAt.getTime() < now
        ? 'ended'
        : promotion.startsAt.getTime() > now
          ? 'upcoming'
          : 'active',
    serviceIds: promotion.services.map((link) => link.service.id),
    serviceNames: promotion.services.map((link) => link.service.name),
  }));

  return <PromotionsClient promotions={rows} services={services} />;
}

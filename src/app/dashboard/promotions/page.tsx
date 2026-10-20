import { Tag } from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { db } from '@/lib/db';
import { listPromotions } from '@/modules/promotions/queries';
import { PromotionsClient } from './promotions-client';

export const metadata: Metadata = { title: 'Promotions - Tableau de bord' };

export default async function PromotionsPage() {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/promotions');

  const [promotions, services] = await Promise.all([
    listPromotions(),
    db.service.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="p-6">
      <div>
        <h1 className="flex items-center gap-2.5 text-2xl font-semibold">
          <Tag aria-hidden="true" className="size-6 text-accent" />
          Promotions
        </h1>
        <p className="mt-1 text-ink-soft">
          Réductions temporaires appliquées automatiquement au moment de la réservation (hors v1
          initial, §19).
        </p>
      </div>
      <div className="mt-5">
        <PromotionsClient promotions={promotions} services={services} />
      </div>
    </div>
  );
}

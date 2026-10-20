import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { listReviewsForModeration } from '@/modules/avis/queries';
import { AvisClient } from './avis-client';

export const metadata: Metadata = { title: 'Avis - Tableau de bord' };

export default async function AvisPage() {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/avis');

  const reviews = await listReviewsForModeration();

  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-semibold">Avis clients</h1>
        <p className="mt-1 text-ink-soft">
          Modération des avis soumis après un rendez-vous terminé (hors v1 initial, §19). Aucun avis
          n’est visible publiquement avant approbation.
        </p>
      </div>
      <div className="mt-5">
        <AvisClient reviews={reviews} />
      </div>
    </div>
  );
}

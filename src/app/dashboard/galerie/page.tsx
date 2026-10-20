import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { db } from '@/lib/db';
import { listGalleryPhotosAdmin } from '@/modules/galerie/queries';
import { GalerieClient } from './galerie-client';

export const metadata: Metadata = { title: 'Galerie - Tableau de bord' };

export default async function GaleriePage() {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/galerie');

  const [photos, services] = await Promise.all([
    listGalleryPhotosAdmin(),
    db.service.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ]);

  return (
    <div className="p-6">
      <div>
        <h1 className="text-2xl font-semibold">Galerie de réalisations</h1>
        <p className="mt-1 text-ink-soft">
          Photos publiques des réalisations (hors v1 initial, §19). Une photo n’est publiée que si
          la cliente a explicitement autorisé son usage.
        </p>
      </div>
      <div className="mt-5">
        <GalerieClient photos={photos} services={services} />
      </div>
    </div>
  );
}

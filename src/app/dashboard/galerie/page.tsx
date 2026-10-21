import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin } from '@/modules/auth/guards';
import { getImageSignedUrl, isStorageConfigured } from '@/modules/fichiers/storage';
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

  // URLs signées calculées en parallèle ; une photo illisible n'empêche pas l'affichage des autres.
  const rows = await Promise.all(
    photos.map(async (photo) => ({
      id: photo.id,
      url: await getImageSignedUrl(photo.key, 3600).catch(() => null),
      alt: photo.alt,
      consentConfirmed: photo.consentConfirmed,
      published: photo.published,
      serviceId: photo.service?.id ?? '',
      serviceName: photo.service?.name ?? null,
    })),
  );

  return <GalerieClient photos={rows} services={services} storageReady={isStorageConfigured()} />;
}

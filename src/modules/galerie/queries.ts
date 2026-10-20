import { db } from '@/lib/db';
import { getImageSignedUrl } from '@/modules/fichiers/storage';

export async function listGalleryPhotosAdmin() {
  return db.galleryPhoto.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { service: { select: { id: true, name: true } } },
  });
}

export interface PublicGalleryPhoto {
  id: string;
  src: string | null;
  alt: string;
  serviceName: string | null;
}

/** Photos publiées (P8.11) : URL signée calculée à chaque lecture (bucket privé). */
export async function listPublishedGalleryPhotos(): Promise<PublicGalleryPhoto[]> {
  const rows = await db.galleryPhoto.findMany({
    where: { published: true, consentConfirmed: true },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    include: { service: { select: { name: true } } },
  });
  return Promise.all(
    rows.map(async (row) => ({
      id: row.id,
      src: await getImageSignedUrl(row.key, 3600).catch(() => null),
      alt: row.alt || row.service?.name || 'Réalisation',
      serviceName: row.service?.name ?? null,
    })),
  );
}

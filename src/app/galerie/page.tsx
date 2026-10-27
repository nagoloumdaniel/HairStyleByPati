import type { Metadata } from 'next';
import { GalleryGrid } from '@/components/galerie/GalleryGrid';
import { EmptyState } from '@/components/shared/EmptyState';
import { Title } from '@/components/ui/Title';
import { listPublishedGalleryPhotos } from '@/modules/galerie/queries';

export const metadata: Metadata = {
  title: 'Mes réalisations',
  description:
    'Un aperçu des dernières réalisations de Patricia à Dakar : locs, nattes collées, vanilles et autres coiffures.',
  alternates: { canonical: '/galerie' },
};

// URLs signées valables 1 h : la page est régénérée bien avant leur expiration.
export const revalidate = 300;

export default async function GaleriePage() {
  const photos = await listPublishedGalleryPhotos().catch(() => []);

  return (
    <main className="page-main space-y-8">
      <header className="max-w-3xl space-y-3">
        <Title as="h1" size="display">
          Mes réalisations
        </Title>
        <p className="max-w-prose text-base leading-relaxed text-muted md:text-lg">
          Quelques-unes des dernières coiffures de Patricia. Cliquez sur une photo pour l’agrandir.
        </p>
      </header>
      {photos.length === 0 ? (
        <EmptyState
          title="Les réalisations arrivent bientôt"
          message="Patricia publie ses photos très prochainement. En attendant, découvrez ses prestations."
          actionLabel="Voir le catalogue"
          actionHref="/coiffures"
        />
      ) : (
        <GalleryGrid photos={photos} />
      )}
    </main>
  );
}

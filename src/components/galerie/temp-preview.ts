// TEMP-PREVIEW: à supprimer après vérification
// Élément fictif injecté dans la galerie publique (/galerie) pour valider le design à la main.
// Aucune écriture en base. Pour retirer : supprimer ce fichier + les 2 lignes marquées
// « TEMP-PREVIEW » dans src/app/galerie/page.tsx.
import type { GalleryGridPhoto } from './GalleryGrid';

export const TEMP_PREVIEW_PHOTO: GalleryGridPhoto = {
  id: 'temp-preview',
  src: '/landing/landing.jpeg',
  alt: 'Aperçu provisoire d’une réalisation',
  serviceName: 'Aperçu provisoire',
  caption: 'Élément de test, à supprimer',
};

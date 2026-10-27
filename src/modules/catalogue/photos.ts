/* ============================================================
 * Photos d'une prestation saisies dans le formulaire du catalogue.
 * Logique pure (sans base ni stockage), partagée par le client (limite, jetons)
 * et le serveur (validation obligatoire du plan reçu).
 *
 * Le formulaire envoie :
 * - `photos`     : les NOUVEAUX fichiers, dans l'ordre de sélection ;
 * - `photoOrder` : JSON d'un tableau de jetons dans l'ordre d'affichage final,
 *                  « <idPhotoExistante> » ou « new:<indexDansPhotos> ».
 * La première photo est la photo principale. Une photo existante absente du
 * plan est supprimée (ligne + objet de stockage).
 * ============================================================ */

export const MAX_SERVICE_PHOTOS = 3;
export const NEW_PHOTO_PREFIX = 'new:';

export type PhotoPlanItem = { kind: 'existing'; id: string } | { kind: 'new'; fileIndex: number };

export type PhotoPlanResult =
  { ok: true; items: PhotoPlanItem[]; removeIds: string[] } | { ok: false; error: string };

export const newPhotoToken = (fileIndex: number) => `${NEW_PHOTO_PREFIX}${fileIndex}`;

export function resolvePhotoPlan(input: {
  orderRaw: unknown;
  fileCount: number;
  existingIds: string[];
}): PhotoPlanResult {
  const { fileCount, existingIds } = input;
  let tokens: unknown = [];
  if (typeof input.orderRaw === 'string' && input.orderRaw.trim() !== '') {
    try {
      tokens = JSON.parse(input.orderRaw);
    } catch {
      return { ok: false, error: 'Liste de photos invalide.' };
    }
  }
  if (!Array.isArray(tokens) || tokens.some((t) => typeof t !== 'string' || t.length > 64)) {
    return { ok: false, error: 'Liste de photos invalide.' };
  }
  if (tokens.length > MAX_SERVICE_PHOTOS) {
    return {
      ok: false,
      error: `Une prestation accepte ${MAX_SERVICE_PHOTOS} photos maximum.`,
    };
  }

  const seen = new Set<string>();
  const usedFiles = new Set<number>();
  const items: PhotoPlanItem[] = [];
  for (const token of tokens as string[]) {
    if (seen.has(token)) return { ok: false, error: 'Photo en double dans la liste.' };
    seen.add(token);
    if (token.startsWith(NEW_PHOTO_PREFIX)) {
      const raw = token.slice(NEW_PHOTO_PREFIX.length);
      const fileIndex = /^\d{1,2}$/.test(raw) ? Number(raw) : -1;
      if (fileIndex < 0 || fileIndex >= fileCount) {
        return { ok: false, error: 'Photo envoyée introuvable.' };
      }
      usedFiles.add(fileIndex);
      items.push({ kind: 'new', fileIndex });
    } else {
      if (!existingIds.includes(token)) return { ok: false, error: 'Photo introuvable.' };
      items.push({ kind: 'existing', id: token });
    }
  }
  // Tout fichier envoyé doit être référencé : pas de fichier ignoré ni de contournement de la limite.
  if (usedFiles.size !== fileCount) {
    return { ok: false, error: 'Liste de photos incohérente, rechargez la page.' };
  }

  const kept = new Set(items.flatMap((item) => (item.kind === 'existing' ? [item.id] : [])));
  return { ok: true, items, removeIds: existingIds.filter((id) => !kept.has(id)) };
}

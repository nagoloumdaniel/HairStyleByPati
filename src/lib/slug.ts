/* Génération automatique des slugs (URLs) depuis un nom : jamais saisis par l'admin. */

const MAX_SLUG_LENGTH = 120;

/** Minuscules, sans accents, tirets. Retourne `fallback` si rien d'exploitable. */
export function slugify(value: string, fallback = 'element'): string {
  const slug = value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH - 8)
    .replace(/-+$/g, '');
  return slug || fallback;
}

/**
 * Slug unique : `base`, puis `base-2`, `base-3`… tant que `exists` répond vrai.
 * `exists` doit exclure l'entité elle-même lors d'une modification.
 */
export async function uniqueSlug(
  name: string,
  exists: (slug: string) => Promise<boolean>,
  fallback?: string,
): Promise<string> {
  const base = slugify(name, fallback);
  if (!(await exists(base))) return base;
  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const candidate = `${base}-${suffix}`;
    if (!(await exists(candidate))) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { Button } from '@/components/ui/Button';
import type { CatalogueCategory } from '@/lib/catalogue';

type CatalogueFiltersProps = {
  categories: CatalogueCategory[];
  initialSearch: string;
  initialCategory: string;
  total: number;
};

function buildCatalogueHref(search: string, category: string): string {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (category) params.set('category', category);
  const query = params.toString();
  return query ? `/coiffures?${query}` : '/coiffures';
}

/**
 * Recherche et filtres du catalogue (P3.2).
 * - Recherche soumise au clavier (Entrée) ou après une courte pause de frappe.
 * - Filtres catégories en liens, donc fonctionnels sans JavaScript.
 * - État de chargement annoncé et visible pendant la navigation.
 */
export function CatalogueFilters({
  categories,
  initialSearch,
  initialCategory,
  total,
}: CatalogueFiltersProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch);
  const [isPending, startTransition] = useTransition();
  const categoryRef = useRef(initialCategory);

  // Suit la catégorie réellement appliquée par l'URL (le select n'est pas contrôlé).
  categoryRef.current = initialCategory;

  // Re-synchronise le champ après un retour navigateur ou un changement d'URL.
  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  const navigate = useCallback(
    (nextSearch: string, nextCategory: string) => {
      categoryRef.current = nextCategory;
      startTransition(() => {
        router.replace(buildCatalogueHref(nextSearch, nextCategory), { scroll: false });
      });
    },
    [router],
  );

  // Recherche « instantanée » : 400 ms après la dernière frappe.
  useEffect(() => {
    if (search === initialSearch) return;
    const timer = window.setTimeout(() => {
      navigate(search, categoryRef.current);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [search, initialSearch, navigate]);

  const hasFilters = initialSearch !== '' || initialCategory !== '';
  const resultLabel = `${total} coiffure${total > 1 ? 's' : ''} trouvée${total > 1 ? 's' : ''}`;

  return (
    <section
      aria-labelledby="filtres-titre"
      className="space-y-5 rounded-[var(--radius-lg)] border border-card/70 bg-card/80 p-5 shadow-soft backdrop-blur-md md:p-6"
    >
      <h2 id="filtres-titre" className="sr-only">
        Rechercher et filtrer les coiffures
      </h2>

      <form
        action="/coiffures"
        method="get"
        onSubmit={(event) => {
          event.preventDefault();
          navigate(search, initialCategory);
        }}
        className="flex flex-col gap-3 sm:flex-row"
        aria-busy={isPending || undefined}
      >
        <div className="relative flex-1">
          <label htmlFor="catalogue-search" className="sr-only">
            Rechercher une coiffure
          </label>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
          </span>
          <input
            id="catalogue-search"
            name="search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tresses, vanilles, locs…"
            autoComplete="off"
            className="w-full rounded-[var(--radius-md)] border border-line bg-card py-2.5 pl-10 pr-10 text-fg placeholder:text-muted/70 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {isPending ? (
            <span
              aria-hidden="true"
              className="absolute right-3.5 top-1/2 inline-block size-4 -translate-y-1/2 animate-spin rounded-full border-2 border-cacao border-t-transparent"
            />
          ) : null}
        </div>

        <Button type="submit" loading={isPending} className="sm:px-6">
          Rechercher
        </Button>
      </form>

      <nav aria-label="Filtrer par catégorie" className="flex flex-wrap gap-2">
        <Link
          href={buildCatalogueHref(initialSearch, '')}
          scroll={false}
          aria-current={initialCategory === '' ? 'page' : undefined}
          className={`inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border px-3.5 py-1.5 text-sm font-medium transition ${
            initialCategory === ''
              ? 'border-cacao bg-cacao text-cacao-fg'
              : 'border-line bg-card text-fg hover:border-cacao hover:bg-page'
          }`}
        >
          Toutes
        </Link>
        {categories.map((category) => {
          const active = category.slug === initialCategory;
          return (
            <Link
              key={category.slug}
              href={buildCatalogueHref(initialSearch, category.slug)}
              scroll={false}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex items-center gap-1.5 rounded-[var(--radius-full)] border px-3.5 py-1.5 text-sm font-medium transition ${
                active
                  ? 'border-cacao bg-cacao text-cacao-fg'
                  : 'border-line bg-card text-fg hover:border-cacao hover:bg-page'
              }`}
            >
              {category.name}
              <span className={active ? 'text-cacao-fg/80' : 'text-muted'}>{category.count}</span>
            </Link>
          );
        })}
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/70 pt-3">
        <p className="text-sm text-muted" aria-live="polite">
          {isPending ? 'Mise à jour des résultats…' : resultLabel}
        </p>
        {hasFilters ? (
          <Link
            href="/coiffures"
            scroll={false}
            className="text-sm font-semibold text-cacao underline-offset-4 hover:underline"
          >
            Réinitialiser les filtres
          </Link>
        ) : null}
      </div>
    </section>
  );
}

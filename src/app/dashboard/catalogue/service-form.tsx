'use client';

import { useActionState, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import type { AdminServiceDetail } from '@/lib/catalogue-admin';
import { PRICE_MODE_LABELS, PRICE_MODES, type PriceMode } from '@/modules/catalogue/schemas';
import { centsToEurosInput, priceModeFromService } from '@/modules/catalogue/pricing';
import type { CatalogueActionState } from '@/modules/catalogue/actions';

/* ============================================================
 * P4.3 — Formulaire prestation : identité, catégorie, prix
 * (fixe, départ, fourchette, à confirmer), durée et statut.
 * ============================================================ */

interface CategoryOption {
  id: string;
  name: string;
  active: boolean;
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

export function ServiceForm({
  action,
  categories,
  initial,
  submitLabel,
}: {
  action: (prev: CatalogueActionState, formData: FormData) => Promise<CatalogueActionState>;
  categories: CategoryOption[];
  initial?: AdminServiceDetail;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(action, {});
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.id));
  const [priceMode, setPriceMode] = useState<PriceMode>(() =>
    initial ? priceModeFromService(initial) : 'FROM',
  );

  const fromDefault = initial ? centsToEurosInput(initial.priceFromCents) : '';
  const toDefault = initial ? centsToEurosInput(initial.priceToCents) : '';

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Nom de la prestation"
          name="name"
          required
          value={name}
          onChange={(event) => {
            const next = event.target.value;
            setName(next);
            if (!slugTouched) setSlug(slugify(next));
          }}
        />
        <Input
          label="Slug"
          name="slug"
          required
          value={slug}
          onChange={(event) => {
            setSlugTouched(true);
            setSlug(event.target.value);
          }}
          hint="Utilisé dans l'URL publique, par exemple /coiffures/tresses-collées."
        />
      </div>

      <Textarea
        label="Description"
        name="description"
        defaultValue={initial?.description ?? ''}
        hint="Décrivez la prestation, le rendu attendu et les conseils d'entretien."
        rows={4}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Select
          label="Catégorie"
          name="categoryId"
          required
          defaultValue={initial?.categoryId ?? ''}
          options={[
            { value: '', label: 'Choisir une catégorie' },
            ...categories.map((category) => ({
              value: category.id,
              label: category.active ? category.name : `${category.name} (désactivée)`,
            })),
          ]}
        />
        <Select
          label="Mode de prix"
          name="priceMode"
          value={priceMode}
          onChange={(event) => setPriceMode(event.target.value as PriceMode)}
          options={PRICE_MODES.map((mode) => ({ value: mode, label: PRICE_MODE_LABELS[mode] }))}
        />
        <Select
          label="Statut"
          name="status"
          defaultValue={initial?.status ?? 'DRAFT'}
          options={[
            { value: 'DRAFT', label: 'Brouillon (invisible sur le site)' },
            { value: 'PUBLISHED', label: 'Publié (visible sur le site)' },
            { value: 'ARCHIVED', label: 'Archivé' },
          ]}
        />
      </div>

      <fieldset className="rounded-[var(--radius-md)] border border-cream-dark p-4">
        <legend className="px-2 text-sm font-semibold">Prix</legend>
        {priceMode === 'ON_REQUEST' ? (
          <p className="text-sm text-ink-soft">
            Le prix sera affiché « Prix à confirmer » sur le site. Vous pourrez le préciser ensuite.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={priceMode === 'RANGE' ? 'Prix minimum (€)' : 'Prix (€)'}
              name="priceFromEuros"
              type="number"
              min={0}
              step="0.01"
              required
              defaultValue={fromDefault}
              hint="Exemple : 45 ou 45,50."
            />
            {priceMode === 'RANGE' ? (
              <Input
                label="Prix maximum (€)"
                name="priceToEuros"
                type="number"
                min={0}
                step="0.01"
                defaultValue={toDefault}
                hint="Laissez vide si le prix exact reste à confirmer."
              />
            ) : null}
          </div>
        )}
        <p className="mt-3 text-sm text-ink-soft">
          {priceMode === 'FIXED'
            ? 'Un prix unique est affiché.'
            : priceMode === 'FROM'
              ? 'Le site affichera « À partir de ».'
              : priceMode === 'RANGE'
                ? 'Le site affichera une fourchette de prix.'
                : 'Aucun montant ne sera affiché.'}
        </p>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label="Durée (minutes)"
          name="durationMinutes"
          type="number"
          min={1}
          max={480}
          defaultValue={initial?.durationMinutes ?? ''}
          hint="Facultative si la durée dépend de la longueur des cheveux."
        />
        <Input
          label="Ordre d'affichage"
          name="order"
          type="number"
          min={0}
          defaultValue={String(initial?.order ?? 0)}
          hint="Les plus petits nombres apparaissent en premier."
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] bg-alert-soft px-4 py-3 text-sm font-medium text-alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          role="status"
          className="rounded-[var(--radius-md)] bg-success-soft px-4 py-3 text-sm font-medium text-success"
        >
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending}>
          {submitLabel}
        </Button>
        <p className="text-sm text-ink-soft">
          Les modifications sont enregistrées immédiatement et journalisées.
        </p>
      </div>
    </form>
  );
}

'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import type { AdminCategory } from '@/lib/catalogue-admin';
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminReorderCategories,
  adminSetCategoryActive,
  adminUpdateCategory,
  type CatalogueActionState,
} from '@/modules/catalogue/actions';

/* ============================================================
 * P4.2 — CRUD complet des catégories : créer, modifier,
 * activer/désactiver, réordonner, supprimer si vide.
 * ============================================================ */

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function CategoryForm({
  action,
  initial,
  submitLabel,
  onDone,
}: {
  action: (prev: CatalogueActionState, formData: FormData) => Promise<CatalogueActionState>;
  initial?: AdminCategory;
  submitLabel: string;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(action, {});
  const [name, setName] = useState(initial?.name ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.id));
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (state.success) doneRef.current?.();
  }, [state.success]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <Input
        label="Nom"
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
        hint="Minuscules, chiffres et tirets. Utilisé dans l'URL publique."
      />
      <Textarea
        label="Description (facultative)"
        name="description"
        defaultValue={initial?.description ?? ''}
      />
      <div className="flex flex-wrap items-end gap-4">
        <div className="max-w-32">
          <Input
            label="Ordre d'affichage"
            name="order"
            type="number"
            min={0}
            defaultValue={String(initial?.order ?? 0)}
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm font-semibold">
          <input
            type="checkbox"
            name="active"
            defaultChecked={initial?.active ?? true}
            className="size-4"
          />
          Catégorie active
        </label>
      </div>
      {state.error ? (
        <p role="alert" className="text-sm font-medium text-alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p role="status" className="text-sm font-medium text-success">
          {state.success}
        </p>
      ) : null}
      <Button type="submit" loading={pending}>
        {submitLabel}
      </Button>
    </form>
  );
}

function EditCategoryButton({ category }: { category: AdminCategory }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Modifier
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Modifier ${category.name}`}>
        <CategoryForm
          action={adminUpdateCategory}
          initial={category}
          submitLabel="Enregistrer"
          onDone={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}

function ToggleCategoryForm({ category }: { category: AdminCategory }) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(
    adminSetCategoryActive,
    {},
  );
  const nextActive = !category.active;
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={category.id} />
      <input type="hidden" name="active" value={String(nextActive)} />
      <Button type="submit" variant="secondary" size="sm" loading={pending}>
        {nextActive ? 'Activer' : 'Désactiver'}
      </Button>
      {state.error ? (
        <p role="alert" className="mt-1 text-xs font-medium text-alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function DeleteCategoryForm({ category }: { category: AdminCategory }) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(
    adminDeleteCategory,
    {},
  );
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Supprimer définitivement la catégorie « ${category.name} » ?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={category.id} />
      <Button type="submit" variant="danger" size="sm" loading={pending}>
        Supprimer
      </Button>
      {state.error ? (
        <p role="alert" className="mt-1 max-w-56 text-xs font-medium text-alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function ReorderButton({
  categories,
  index,
  direction,
}: {
  categories: AdminCategory[];
  index: number;
  direction: -1 | 1;
}) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(
    adminReorderCategories,
    {},
  );
  const target = index + direction;
  const disabled = target < 0 || target >= categories.length;
  const current = categories[index];
  if (disabled || !current) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)] border border-line text-muted/40"
      >
        {direction === -1 ? (
          <ArrowUp aria-hidden="true" className="size-4" />
        ) : (
          <ArrowDown aria-hidden="true" className="size-4" />
        )}
      </span>
    );
  }

  const reordered = [...categories];
  const swap = reordered[target];
  if (!swap) return null;
  reordered[index] = swap;
  reordered[target] = current;
  const items = reordered.map((category, order) => ({ id: category.id, order }));

  return (
    <form action={formAction}>
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        disabled={pending}
        aria-label={`${direction === -1 ? 'Monter' : 'Descendre'} ${current.name}`}
        title={direction === -1 ? 'Monter' : 'Descendre'}
      >
        {pending ? (
          '…'
        ) : direction === -1 ? (
          <ArrowUp aria-hidden="true" className="size-4" />
        ) : (
          <ArrowDown aria-hidden="true" className="size-4" />
        )}
      </Button>
      {state.error ? (
        <span role="alert" className="text-xs text-alert">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

function NewCategoryButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" size="sm" onClick={() => setOpen(true)}>
        Nouvelle catégorie
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouvelle catégorie">
        <CategoryForm
          action={adminCreateCategory}
          submitLabel="Créer la catégorie"
          onDone={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}

export function CategoriesTab({ categories }: { categories: AdminCategory[] }) {
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          {categories.length} catégorie{categories.length > 1 ? 's' : ''}. L’ordre est repris sur le
          site public.
        </p>
        <NewCategoryButton />
      </div>

      {categories.length === 0 ? (
        <p className="rounded-[var(--radius-md)] border border-dashed border-line p-8 text-center text-muted">
          Aucune catégorie. Créez la première pour organiser le catalogue.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {categories.map((category, index) => (
            <li
              key={category.id}
              className="rounded-[var(--radius-md)] border border-line bg-card p-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex min-w-0 items-start gap-2">
                  <div className="flex flex-col gap-1">
                    <ReorderButton categories={categories} index={index} direction={-1} />
                    <ReorderButton categories={categories} index={index} direction={1} />
                  </div>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      <span className="truncate">{category.name}</span>
                      <span className="font-normal text-muted">({category.slug})</span>
                      {category.active ? (
                        <Badge tone="success">Active</Badge>
                      ) : (
                        <Badge tone="alert">Désactivée</Badge>
                      )}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Ordre {category.order} · {category.serviceCount} prestation
                      {category.serviceCount > 1 ? 's' : ''}
                    </p>
                    {category.description ? (
                      <p className="mt-1 line-clamp-2 text-sm text-muted">{category.description}</p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <EditCategoryButton category={category} />
                  <ToggleCategoryForm category={category} />
                  <DeleteCategoryForm category={category} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

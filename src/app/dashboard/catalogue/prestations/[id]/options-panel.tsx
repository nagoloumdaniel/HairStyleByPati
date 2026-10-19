'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import type { AdminServiceOption } from '@/lib/catalogue-admin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import {
  adminCreateOption,
  adminDeleteOption,
  adminToggleOption,
  adminUpdateOption,
  type CatalogueActionState,
} from '@/modules/catalogue/actions';

/* ============================================================
 * P4.3 — Options payantes d'une prestation (prix et durée
 * additionnels). Elles alimenteront le parcours de réservation.
 * ============================================================ */

const euroFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

function formatCents(cents: number): string {
  return euroFormatter.format(cents / 100);
}

function OptionForm({
  action,
  serviceId,
  initial,
  submitLabel,
  onDone,
}: {
  action: (prev: CatalogueActionState, formData: FormData) => Promise<CatalogueActionState>;
  serviceId: string;
  initial?: AdminServiceOption;
  submitLabel: string;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(action, {});
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (state.success) doneRef.current?.();
  }, [state.success]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="serviceId" value={serviceId} />
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <Input label="Nom de l'option" name="name" required defaultValue={initial?.name ?? ''} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Prix (€)"
          name="priceEuros"
          type="number"
          min={0}
          step="0.01"
          required
          defaultValue={initial ? String(initial.priceCents / 100) : ''}
        />
        <Input
          label="Durée ajoutée (minutes)"
          name="durationMinutes"
          type="number"
          min={0}
          max={480}
          defaultValue={String(initial?.durationMinutes ?? 0)}
          hint="0 si l'option n'allonge pas la prestation."
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          name="active"
          defaultChecked={initial?.active ?? true}
          className="size-4"
        />
        Option active
      </label>
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

function EditOptionButton({
  serviceId,
  option,
}: {
  serviceId: string;
  option: AdminServiceOption;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Modifier
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Modifier ${option.name}`}>
        <OptionForm
          action={adminUpdateOption}
          serviceId={serviceId}
          initial={option}
          submitLabel="Enregistrer"
          onDone={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}

function ToggleOptionForm({ option }: { option: AdminServiceOption }) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(
    adminToggleOption,
    {},
  );
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={option.id} />
      <input type="hidden" name="active" value={String(!option.active)} />
      <Button type="submit" variant="ghost" size="sm" loading={pending}>
        {option.active ? 'Désactiver' : 'Activer'}
      </Button>
      {state.error ? (
        <p role="alert" className="text-xs text-alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function DeleteOptionForm({ option }: { option: AdminServiceOption }) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(
    adminDeleteOption,
    {},
  );
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Supprimer l'option « ${option.name} » ?`)) event.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={option.id} />
      <Button type="submit" variant="danger" size="sm" loading={pending}>
        Supprimer
      </Button>
      {state.error ? (
        <p role="alert" className="text-xs text-alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

export function OptionsPanel({
  serviceId,
  options,
}: {
  serviceId: string;
  options: AdminServiceOption[];
}) {
  const [createOpen, setCreateOpen] = useState(false);
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-soft">
          Options facturées en plus de la prestation (mèches, soin, finition).
        </p>
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
          Ajouter une option
        </Button>
      </div>
      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouvelle option">
        <OptionForm
          action={adminCreateOption}
          serviceId={serviceId}
          submitLabel="Ajouter l'option"
          onDone={() => setCreateOpen(false)}
        />
      </Modal>

      {options.length === 0 ? (
        <p className="rounded-[var(--radius-md)] border border-dashed border-cream-dark p-8 text-center text-ink-soft">
          Aucune option. La prestation s’ajoute au panier sans supplément.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {options.map((option) => (
            <li
              key={option.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-cream-dark bg-surface p-3"
            >
              <div className="min-w-0">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  <span className="truncate">{option.name}</span>
                  {option.active ? (
                    <Badge tone="success">Active</Badge>
                  ) : (
                    <Badge tone="alert">Désactivée</Badge>
                  )}
                </p>
                <p className="mt-1 text-sm text-ink-soft">
                  {formatCents(option.priceCents)}
                  {option.durationMinutes > 0
                    ? ` · +${option.durationMinutes} min`
                    : ' · sans durée ajoutée'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <EditOptionButton serviceId={serviceId} option={option} />
                <ToggleOptionForm option={option} />
                <DeleteOptionForm option={option} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

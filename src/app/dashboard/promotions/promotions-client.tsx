'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import {
  adminCreatePromotion,
  adminDeletePromotion,
  adminSetPromotionActive,
  type PromotionActionState,
} from '@/modules/promotions/actions';

type PromotionRow = {
  id: string;
  name: string;
  kind: 'PERCENT' | 'FIXED';
  value: number;
  startsAt: Date;
  endsAt: Date;
  active: boolean;
  services: { service: { id: string; name: string } }[];
};

function formatValue(kind: 'PERCENT' | 'FIXED', value: number): string {
  return kind === 'PERCENT'
    ? `-${value} %`
    : `-${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value / 100)}`;
}

function NewPromotionForm({ services }: { services: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState<PromotionActionState, FormData>(
    adminCreatePromotion,
    {},
  );
  const [kind, setKind] = useState<'PERCENT' | 'FIXED'>('PERCENT');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) formRef.current?.reset();
  }, [state.success]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex flex-col gap-4 rounded-[var(--radius-md)] border border-line bg-card p-4"
    >
      <h2 className="font-semibold text-fg">Nouvelle promotion</h2>
      <Input label="Nom" name="name" required placeholder="Offre de lancement" />
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="text-sm font-semibold text-fg" htmlFor="promo-kind">
            Type de réduction
          </label>
          <select
            id="promo-kind"
            name="kind"
            value={kind}
            onChange={(event) => setKind(event.target.value as 'PERCENT' | 'FIXED')}
            className="mt-1 rounded-[var(--radius-md)] border border-line bg-card px-4 py-2.5 text-fg"
          >
            <option value="PERCENT">Pourcentage</option>
            <option value="FIXED">Montant fixe</option>
          </select>
        </div>
        <div className="max-w-40">
          <Input
            label={kind === 'PERCENT' ? 'Pourcentage (1-100)' : 'Montant (€)'}
            name="value"
            type="number"
            min={0}
            step={kind === 'PERCENT' ? 1 : 0.01}
            required
          />
        </div>
        <div>
          <Input label="Début" name="startsAt" type="date" required />
        </div>
        <div>
          <Input label="Fin" name="endsAt" type="date" required />
        </div>
      </div>
      <fieldset>
        <legend className="text-sm font-semibold text-fg">Prestations concernées</legend>
        <div className="mt-2 flex max-h-40 flex-col gap-1 overflow-y-auto rounded-[var(--radius-md)] border border-line p-2">
          {services.map((service) => (
            <label key={service.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="serviceIds" value={service.id} className="size-4" />
              {service.name}
            </label>
          ))}
        </div>
      </fieldset>
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
        Créer la promotion
      </Button>
    </form>
  );
}

function PromotionRowActions({ promotion }: { promotion: PromotionRow }) {
  const [toggleState, toggleAction, togglePending] = useActionState<PromotionActionState, FormData>(
    adminSetPromotionActive,
    {},
  );
  const [deleteState, deleteAction, deletePending] = useActionState<PromotionActionState, FormData>(
    adminDeletePromotion,
    {},
  );
  return (
    <div className="flex flex-wrap items-center gap-2">
      <form action={toggleAction}>
        <input type="hidden" name="id" value={promotion.id} />
        <input type="hidden" name="active" value={String(!promotion.active)} />
        <Button type="submit" variant="secondary" size="sm" loading={togglePending}>
          {promotion.active ? 'Désactiver' : 'Activer'}
        </Button>
      </form>
      <form
        action={deleteAction}
        onSubmit={(event) => {
          if (!window.confirm(`Supprimer la promotion « ${promotion.name} » ?`)) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={promotion.id} />
        <Button type="submit" variant="danger" size="sm" loading={deletePending}>
          Supprimer
        </Button>
      </form>
      {toggleState.error || deleteState.error ? (
        <span role="alert" className="text-xs text-alert">
          {toggleState.error ?? deleteState.error}
        </span>
      ) : null}
    </div>
  );
}

export function PromotionsClient({
  promotions,
  services,
}: {
  promotions: PromotionRow[];
  services: { id: string; name: string }[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <NewPromotionForm services={services} />
      <ul className="flex flex-col gap-2">
        {promotions.length === 0 ? (
          <p className="rounded-[var(--radius-md)] border border-dashed border-line p-8 text-center text-muted">
            Aucune promotion. Créez-en une ci-dessus.
          </p>
        ) : (
          promotions.map((promotion) => (
            <li
              key={promotion.id}
              className="rounded-[var(--radius-md)] border border-line bg-card p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 font-semibold text-fg">
                    {promotion.name}
                    <Badge tone={promotion.active ? 'success' : 'neutral'}>
                      {promotion.active ? 'Active' : 'Désactivée'}
                    </Badge>
                  </p>
                  <p className="text-sm text-muted">
                    {formatValue(promotion.kind, promotion.value)} ·{' '}
                    <LocalDateTime iso={promotion.startsAt.toISOString()} /> →{' '}
                    <LocalDateTime iso={promotion.endsAt.toISOString()} />
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    {promotion.services.map((s) => s.service.name).join(', ') ||
                      'Aucune prestation'}
                  </p>
                </div>
                <PromotionRowActions promotion={promotion} />
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

'use client';

import { useActionState } from 'react';
import type { AdminCompatibilityRule } from '@/lib/catalogue-admin';
import { HAIR_TYPE_OPTIONS } from '@/modules/compatibilite/questions';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { adminSaveCompatibility, type CatalogueActionState } from '@/modules/catalogue/actions';

/* ============================================================
 * P4.7 — Éditeur des règles de compatibilité capillaire.
 * Ces règles sont évaluées côté serveur par le moteur P5.
 * ============================================================ */

const HAIR_LENGTHS = [
  { value: 'SHORT', label: 'Cheveux courts' },
  { value: 'MEDIUM', label: 'Longueur moyenne' },
  { value: 'LONG', label: 'Cheveux longs' },
  { value: 'VERY_LONG', label: 'Cheveux très longs' },
] as const;

const PHOTO_POLICIES = [
  { value: 'OPTIONAL', label: 'Photo facultative' },
  { value: 'REQUIRED', label: 'Photo obligatoire' },
  { value: 'FORBIDDEN', label: 'Photo inutile pour cette prestation' },
] as const;

export function CompatibilityPanel({
  serviceId,
  rule,
}: {
  serviceId: string;
  rule: AdminCompatibilityRule | null;
}) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(
    adminSaveCompatibility,
    {},
  );
  const accepted = new Set(rule?.acceptedLengths ?? []);
  const acceptedHairTypes = new Set(rule?.acceptedHairTypes ?? []);

  return (
    <form action={formAction} className="flex flex-col gap-5 p-4">
      <input type="hidden" name="serviceId" value={serviceId} />

      <fieldset className="rounded-[var(--radius-md)] border border-cream-dark p-4">
        <legend className="px-2 text-sm font-semibold">Longueurs de cheveux acceptées</legend>
        <p className="mb-3 text-sm text-ink-soft">
          Si aucune longueur n’est cochée, aucune restriction de longueur n’est appliquée.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {HAIR_LENGTHS.map((length) => (
            <label key={length.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="acceptedLengths"
                value={length.value}
                defaultChecked={accepted.has(length.value)}
                className="size-4"
              />
              {length.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-[var(--radius-md)] border border-cream-dark p-4">
        <legend className="px-2 text-sm font-semibold">Types de cheveux acceptés</legend>
        <p className="mb-3 text-sm text-ink-soft">
          Si aucun type n’est coché, tous les types sont acceptés. Un type non listé déclenche une
          demande d’évaluation.
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {HAIR_TYPE_OPTIONS.map((hairType) => (
            <label key={hairType} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="acceptedHairTypes"
                value={hairType}
                defaultChecked={acceptedHairTypes.has(hairType)}
                className="size-4"
              />
              {hairType}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="rounded-[var(--radius-md)] border border-cream-dark p-4">
        <legend className="px-2 text-sm font-semibold">Locs</legend>
        <div className="flex flex-col gap-2">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="requiresLocs"
              defaultChecked={rule?.requiresLocs ?? false}
              className="mt-0.5 size-4"
            />
            <span>
              Les locs sont obligatoires pour cette prestation.
              <span className="block text-ink-soft">La cliente doit déjà porter des locs.</span>
            </span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="incompatibleLocs"
              defaultChecked={rule?.incompatibleLocs ?? false}
              className="mt-0.5 size-4"
            />
            <span>
              Les locs sont incompatibles avec cette prestation.
              <span className="block text-ink-soft">
                La prestation est refusée si la cliente porte des locs.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <fieldset className="rounded-[var(--radius-md)] border border-cream-dark p-4">
        <legend className="px-2 text-sm font-semibold">Photo et validation</legend>
        <div className="flex flex-col gap-4">
          <Select
            label="Photo de la cliente"
            name="photoPolicy"
            defaultValue={rule?.photoPolicy ?? 'OPTIONAL'}
            options={PHOTO_POLICIES.map((policy) => ({ value: policy.value, label: policy.label }))}
          />
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              name="autoApprove"
              defaultChecked={rule?.autoApprove ?? false}
              className="mt-0.5 size-4"
            />
            <span>
              Accepter automatiquement l’évaluation.
              <span className="block text-ink-soft">
                Si cette case est décochée, l’évaluation arrive dans la file de validation.
              </span>
            </span>
          </label>
        </div>
      </fieldset>

      <div className="grid gap-4">
        <Textarea
          label="Conditions particulières (facultatif)"
          name="conditionsNote"
          defaultValue={rule?.conditionsNote ?? ''}
          hint="Affichées à la cliente et à Patricia, par exemple un soin préalable ou un temps supplémentaire."
          rows={2}
        />
        <Textarea
          label="Message si la prestation est incompatible"
          name="incompatibleMessage"
          defaultValue={rule?.incompatibleMessage ?? ''}
          hint="Expliquez pourquoi et proposez une alternative. Laissez vide pour utiliser le message par défaut."
          rows={3}
        />
        <Textarea
          label="Message si la compatibilité est incertaine"
          name="uncertainMessage"
          defaultValue={rule?.uncertainMessage ?? ''}
          hint="Par exemple : envoyez une photo pour que Patricia confirme."
          rows={3}
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

      <div>
        <Button type="submit" loading={pending}>
          Enregistrer les règles
        </Button>
      </div>
    </form>
  );
}

'use client';

import { useActionState, useEffect, useState } from 'react';
import { submitCustomRequest, type CustomRequestSubmitState } from '@/modules/demandes/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

function todayISO(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function CustomRequestForm() {
  const [state, formAction, pending] = useActionState<CustomRequestSubmitState, FormData>(
    submitCustomRequest,
    {},
  );
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  if (state.success) {
    return (
      <div
        role="status"
        className="rounded-[var(--radius-lg)] border border-success/30 bg-success-soft p-6"
      >
        <h2 className="font-heading text-2xl font-bold text-success">Demande bien reçue</h2>
        <p className="mt-2 text-fg">{state.success}</p>
        <p className="mt-3 text-sm text-ink-soft">
          Vous recevrez un accusé de réception par e-mail. Patricia vous répondra personnellement
          après étude de votre projet.
        </p>
        <Button
          type="button"
          variant="secondary"
          className="mt-5"
          onClick={() => window.location.assign('/demandes-personnalisees')}
        >
          Envoyer une autre demande
        </Button>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="space-y-6 rounded-[var(--radius-lg)] bg-card p-5 shadow-soft sm:p-6"
    >
      <div className="hidden" aria-hidden="true">
        <label htmlFor="demande-website">Site web</label>
        <input id="demande-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="space-y-4">
        <legend className="font-heading text-xl font-bold text-fg">Vos coordonnées</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nom et prénom"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
          />
          <Input
            label="E-mail"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={200}
          />
          <Input
            label="Téléphone (facultatif)"
            name="phone"
            type="tel"
            autoComplete="tel"
            maxLength={30}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-heading text-xl font-bold text-fg">Votre coiffure</legend>
        <Textarea
          label="Décrivez la coiffure souhaitée"
          name="description"
          rows={4}
          required
          minLength={20}
          maxLength={3000}
          hint="Forme, longueur, technique, inspiration, occasion. Plus votre description est précise, mieux Patricia pourra vous répondre."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Longueur actuelle"
            name="hairLength"
            required
            options={[
              { value: 'SHORT', label: 'Courts' },
              { value: 'MEDIUM', label: 'Mi-longs' },
              { value: 'LONG', label: 'Longs' },
              { value: 'VERY_LONG', label: 'Très longs' },
            ]}
          />
          <Input
            label="Type de cheveux"
            name="hairType"
            required
            minLength={2}
            maxLength={120}
            hint="Exemples : naturels, défrisés, locs, cheveux fins."
          />
          <Input
            label="Coiffure actuelle (facultatif)"
            name="currentStyle"
            maxLength={200}
            hint="Exemple : vanilles depuis 3 semaines."
          />
          <Input
            label="Date souhaitée (facultatif)"
            name="desiredDate"
            type="date"
            min={todayISO()}
          />
        </div>
        <Textarea
          label="Précisions complémentaires (facultatif)"
          name="comment"
          rows={2}
          maxLength={1000}
          hint="Contraintes de temps, budget, accessoires, sensibilité du cuir chevelu."
        />
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="font-heading text-xl font-bold text-fg">Photos de référence</legend>
        <p className="text-sm text-ink-soft">
          Jusqu’à 3 photos, 5 Mo maximum chacune. Les photos restent privées et servent uniquement à
          l’étude de votre demande.
        </p>
        <input
          type="file"
          name="photos"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="block w-full rounded-[var(--radius-md)] border border-line bg-page p-3 text-sm text-fg file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-semibold file:text-accent-fg"
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []).slice(0, 3);
            setPreviews(files.map((file) => URL.createObjectURL(file)));
          }}
        />
        {previews.length > 0 ? (
          <ul className="flex flex-wrap gap-3">
            {previews.map((url) => (
              <li key={url}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Aperçu d’une photo de référence"
                  className="size-24 rounded-[var(--radius-sm)] object-cover"
                />
              </li>
            ))}
          </ul>
        ) : null}
      </fieldset>

      <div className="flex items-start gap-2 rounded-[var(--radius-md)] border border-line bg-page p-3">
        <input
          id="demande-consent"
          name="consent"
          type="checkbox"
          required
          className="mt-1 size-4"
        />
        <label htmlFor="demande-consent" className="text-sm text-ink-soft">
          J’accepte que mes informations et mes photos soient utilisées pour traiter ma demande. Je
          peux demander leur suppression à tout moment.
        </label>
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] bg-alert-soft px-4 py-3 text-sm text-alert"
        >
          {state.error}
        </p>
      ) : null}

      <Button type="submit" loading={pending}>
        {pending ? 'Envoi de la demande…' : 'Envoyer ma demande'}
      </Button>
    </form>
  );
}

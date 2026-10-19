'use client';

import { useActionState } from 'react';
import { adminSaveSalonProfile, type SalonProfileState } from '@/modules/parametres/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

export function SalonProfileForm({
  settings,
}: {
  settings: {
    name: string;
    contactEmail: string | null;
    phone: string | null;
    address: string | null;
    logoUrl: string | null;
    emailSignature: string | null;
    cancellationPolicy: string | null;
    bookingPolicy: string | null;
    openingHours: unknown;
  };
}) {
  const [state, formAction, pending] = useActionState<SalonProfileState, FormData>(
    adminSaveSalonProfile,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nom du salon"
          name="name"
          defaultValue={settings.name}
          required
          maxLength={120}
        />
        <Input
          label="E-mail public"
          name="contactEmail"
          type="email"
          defaultValue={settings.contactEmail ?? ''}
          maxLength={200}
        />
        <Input
          label="Téléphone"
          name="phone"
          type="tel"
          defaultValue={settings.phone ?? ''}
          maxLength={30}
        />
        <Input
          label="Logo (URL https, facultatif)"
          name="logoUrl"
          type="url"
          defaultValue={settings.logoUrl ?? ''}
          maxLength={500}
        />
      </div>
      <Textarea
        label="Adresse"
        name="address"
        rows={2}
        defaultValue={settings.address ?? ''}
        maxLength={300}
      />
      <Textarea
        label="Horaires affichés (JSON, facultatif)"
        name="openingHoursText"
        rows={4}
        defaultValue={settings.openingHours ? JSON.stringify(settings.openingHours, null, 2) : ''}
        hint='Exemple : [{"weekday":1,"open":"09:00","close":"18:00"}]'
      />
      <Textarea
        label="Règles d’annulation affichées"
        name="cancellationPolicy"
        rows={3}
        defaultValue={settings.cancellationPolicy ?? ''}
        maxLength={3000}
      />
      <Textarea
        label="Règles de réservation affichées"
        name="bookingPolicy"
        rows={3}
        defaultValue={settings.bookingPolicy ?? ''}
        maxLength={3000}
      />
      <Textarea
        label="Signature des e-mails"
        name="emailSignature"
        rows={2}
        defaultValue={settings.emailSignature ?? ''}
        maxLength={1000}
      />
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending}>
          Enregistrer l’identité
        </Button>
        {state.error ? (
          <p role="alert" className="text-sm text-alert">
            {state.error}
          </p>
        ) : null}
        {state.success ? (
          <p role="status" className="text-sm text-success">
            {state.success}
          </p>
        ) : null}
      </div>
    </form>
  );
}

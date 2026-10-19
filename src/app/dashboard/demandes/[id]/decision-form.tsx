'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { decideCustomRequest, type CustomRequestDecisionState } from '@/modules/demandes/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

export function CustomRequestDecisionForm({
  requestId,
  services,
  currentStatus,
}: {
  requestId: string;
  services: Array<{ id: string; name: string }>;
  currentStatus: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<CustomRequestDecisionState, FormData>(
    decideCustomRequest,
    {},
  );

  useEffect(() => {
    if (state.success) router.refresh();
  }, [state.success, router]);

  return (
    <div className="space-y-4">
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="requestId" value={requestId} />
        <input
          type="hidden"
          name="timeZone"
          value={
            typeof window === 'undefined'
              ? 'Europe/Paris'
              : Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Décision"
            name="action"
            defaultValue={currentStatus === 'NEW' ? 'IN_REVIEW' : 'QUOTED'}
            options={[
              { value: 'IN_REVIEW', label: 'Prendre en charge' },
              { value: 'INFO_REQUESTED', label: 'Demander des précisions' },
              { value: 'QUOTED', label: 'Envoyer un devis' },
              { value: 'ACCEPTED', label: 'Accepter la demande' },
              { value: 'REFUSED', label: 'Refuser la demande' },
              { value: 'CLOSED', label: 'Clôturer' },
            ]}
          />
          <Input
            label="Prix estimatif (€, facultatif)"
            name="estimatedPriceEuros"
            type="number"
            min={0}
            step="0.01"
            placeholder="Exemple : 120"
            hint="Montant en euros, converti en centimes."
          />
          <Select
            label="Prestation existante à proposer (facultatif)"
            name="serviceId"
            defaultValue=""
            options={[
              { value: '', label: 'Aucune' },
              ...services.map((service) => ({ value: service.id, label: service.name })),
            ]}
          />
          <Input
            label="Créneau proposé (facultatif)"
            name="proposedSlotLocal"
            type="datetime-local"
            hint="Une proposition ne réserve pas le créneau."
          />
        </div>
        <Textarea
          label="Message transmis à la cliente"
          name="message"
          rows={4}
          required
          minLength={2}
          maxLength={3000}
          hint="Ce message est enregistré dans l’historique et envoyé par e-mail."
        />
        <Button type="submit" loading={pending}>
          Enregistrer la décision
        </Button>
      </form>
      {state.error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] bg-alert-soft px-4 py-3 text-sm text-alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          role="status"
          className="rounded-[var(--radius-md)] bg-success-soft px-4 py-3 text-sm text-success"
        >
          {state.success}
        </p>
      ) : null}
    </div>
  );
}

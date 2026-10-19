'use client';

import { useActionState } from 'react';
import {
  cancelAppointmentByCustomer,
  type CustomerCancelState,
} from '@/modules/reservations/actions';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';

/* ============================================================
 * P6.7 : annulation par la cliente via son lien sécurisé.
 * ============================================================ */

export function CancelForm({ token, reasonRequired }: { token: string; reasonRequired: boolean }) {
  const [state, formAction, pending] = useActionState<CustomerCancelState, FormData>(
    cancelAppointmentByCustomer,
    {},
  );

  if (state.success) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-success bg-success-soft p-6">
        <h2 className="font-heading text-xl font-bold text-success">Rendez-vous annulé</h2>
        <p className="mt-2 text-sm text-fg">{state.success}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      <Textarea
        label={reasonRequired ? 'Motif de l’annulation (obligatoire)' : 'Motif (facultatif)'}
        name="reason"
        required={reasonRequired}
        rows={3}
        hint="Ce motif aide Patricia à mieux organiser le salon."
      />
      {state.error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] bg-alert-soft px-4 py-3 text-sm font-medium text-alert"
        >
          {state.error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="danger" loading={pending}>
          Confirmer l’annulation
        </Button>
        <a
          href="/contact"
          className="inline-flex items-center rounded-[var(--radius-md)] border border-line bg-card px-5 py-2.5 text-sm font-semibold text-fg transition hover:border-cacao"
        >
          Contacter le salon
        </a>
      </div>
    </form>
  );
}

'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { anonymizeCustomerAction, type CustomerRgpdState } from '@/modules/clients/actions';
import { Button } from '@/components/ui/Button';

export function CustomerRgpdActions({
  customerId,
  customerName,
}: {
  customerId: string;
  customerName: string;
}) {
  const [state, formAction, pending] = useActionState<CustomerRgpdState, FormData>(
    anonymizeCustomerAction,
    {},
  );

  return (
    <div className="mt-6 rounded-[var(--radius-lg)] border border-alert/40 bg-alert-soft p-5">
      <h2 className="font-heading text-xl font-bold text-fg">Droits RGPD</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Export ou effacement des données personnelles de {customerName}. L’effacement supprime les
        conversations, évaluations, demandes et photos privées, puis anonymise la fiche. Les
        rendez-vous sont conservés pour les obligations comptables, sans données capillaires ni
        identité.
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={`/api/admin/clients/${customerId}/export`}
          className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-line bg-card px-4 py-2 text-sm font-semibold text-fg transition hover:border-cacao"
        >
          Exporter les données (JSON)
        </a>
      </div>
      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="customerId" value={customerId} />
        <label className="flex items-start gap-2 text-sm text-ink-soft">
          <input type="checkbox" name="confirm" value="oui" required className="mt-1 size-4" />
          Je confirme vouloir anonymiser définitivement cette fiche et supprimer ses contenus
          privés.
        </label>
        <Button type="submit" variant="danger" size="sm" loading={pending}>
          Anonymiser la fiche
        </Button>
      </form>
      {state.error ? (
        <p role="alert" className="mt-3 text-sm text-alert">
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <div className="mt-3 text-sm text-success">
          <p role="status">{state.success}</p>
          <Link href="/dashboard/clients" className="mt-2 inline-block font-semibold underline">
            Retour à la liste des clientes
          </Link>
        </div>
      ) : null}
    </div>
  );
}

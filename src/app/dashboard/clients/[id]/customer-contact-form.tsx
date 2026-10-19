'use client';

import { useActionState } from 'react';
import { updateCustomerContactAction, type CustomerRgpdState } from '@/modules/clients/actions';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function CustomerContactForm({
  customerId,
  name,
  email,
  phone,
}: {
  customerId: string;
  name: string;
  email: string;
  phone: string;
}) {
  const [state, formAction, pending] = useActionState<CustomerRgpdState, FormData>(
    updateCustomerContactAction,
    {},
  );
  return (
    <form action={formAction} className="mt-3 space-y-3">
      <input type="hidden" name="customerId" value={customerId} />
      <div className="grid gap-3 sm:grid-cols-3">
        <Input label="Nom" name="name" defaultValue={name} required maxLength={100} />
        <Input
          label="E-mail"
          name="email"
          type="email"
          defaultValue={email}
          required
          maxLength={200}
        />
        <Input label="Téléphone" name="phone" type="tel" defaultValue={phone} maxLength={30} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="secondary" size="sm" loading={pending}>
          Mettre à jour les coordonnées
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

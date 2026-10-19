'use client';

import { useActionState } from 'react';
import { login } from '@/modules/auth/actions';

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction, pending] = useActionState(login, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {callbackUrl ? <input type="hidden" name="callbackUrl" value={callbackUrl} /> : null}

      <label className="flex flex-col gap-1 text-sm font-medium">
        E-mail
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          className="rounded-lg border border-cacao/30 bg-card px-3 py-2 focus:outline-2 focus:outline-accent"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm font-medium">
        Mot de passe
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          className="rounded-lg border border-cacao/30 bg-card px-3 py-2 focus:outline-2 focus:outline-accent"
        />
      </label>

      {state.error ? (
        <p role="alert" className="text-sm font-medium text-alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg transition hover:brightness-95 disabled:opacity-60"
      >
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  );
}

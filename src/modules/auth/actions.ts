'use server';

import { z } from 'zod';
import { AuthError } from 'next-auth';
import { parseInput } from '@/lib/errors';
import { signIn, signOut } from './auth';

export interface LoginFormState {
  error?: string;
}

const loginFormSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.string().email('E-mail invalide')),
  password: z.string().min(1, 'Mot de passe requis'),
});

/**
 * Connexion administrateur (P1.7 + P1.9) — validation Zod centralisée
 * via parseInput, messages d'erreur volontairement identiques
 * (e-mail inconnu / mot de passe faux) pour ne pas révéler quels
 * comptes existent. Le callbackUrl est validé séparément : seules
 * les destinations /dashboard* sont autorisées (anti open-redirect).
 */
export async function login(_prev: LoginFormState, formData: FormData): Promise<LoginFormState> {
  let credentials: z.infer<typeof loginFormSchema>;
  try {
    credentials = parseInput(loginFormSchema, Object.fromEntries(formData));
  } catch {
    return { error: 'E-mail ou mot de passe incorrect.' };
  }
  const rawCallback = String(formData.get('callbackUrl') ?? '/dashboard');
  const redirectTo = rawCallback.startsWith('/dashboard') ? rawCallback : '/dashboard';

  try {
    await signIn('credentials', {
      email: credentials.email,
      password: credentials.password,
      redirectTo,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: 'E-mail ou mot de passe incorrect.' };
    }
    throw error; // erreurs de redirection attendues d'Auth.js
  }

  return {};
}

export async function logout(): Promise<void> {
  await signOut({ redirectTo: '/connexion' });
}

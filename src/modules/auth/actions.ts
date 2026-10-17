'use server';

import { AuthError } from 'next-auth';
import { signIn, signOut } from './auth';

export interface LoginFormState {
  error?: string;
}

/**
 * Connexion administrateur (P1.7) — validation serveur, messages
 * d'erreur volontairement identiques (e-mail inconnu / mot de passe
 * faux) pour ne pas révéler quels comptes existent.
 */
export async function login(_prev: LoginFormState, formData: FormData): Promise<LoginFormState> {
  const email = String(formData.get('email') ?? '')
    .trim()
    .toLowerCase();
  const password = String(formData.get('password') ?? '');
  const callbackUrl = String(formData.get('callbackUrl') ?? '/dashboard');
  const redirectTo = callbackUrl.startsWith('/dashboard') ? callbackUrl : '/dashboard';

  try {
    await signIn('credentials', { email, password, redirectTo });
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

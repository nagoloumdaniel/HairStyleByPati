import { auth } from './auth';

/**
 * Garde serveur (P1.8) : à appeler dans CHAQUE server action et route
 * handler d'administration, en plus du middleware. Retourne l'utilisateur
 * admin ou null (appelant doit alors refuser l'opération).
 */
export async function requireAdmin() {
  const session = await auth();
  const user = session?.user;
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

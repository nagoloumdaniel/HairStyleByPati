import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { logout } from '@/modules/auth/actions';

export const metadata: Metadata = {
  title: 'Tableau de bord — Hairstyle by Patricia',
};

export default async function DashboardPage() {
  // P1.8 : garde serveur en plus du middleware (défense en profondeur)
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard');

  return (
    <div>
      <h1 className="text-3xl font-semibold">Tableau de bord</h1>
      <p className="mt-2 text-muted">
        Connecté en tant que <strong>{user.name}</strong> ({user.email}).
      </p>
      <form action={logout} className="mt-6">
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-accent-fg transition hover:brightness-95"
        >
          Se déconnecter
        </button>
      </form>
    </div>
  );
}

import type { Metadata } from 'next';
import { auth } from '@/modules/auth/auth';
import { logout } from '@/modules/auth/actions';

export const metadata: Metadata = {
  title: 'Tableau de bord — Hairstyle by Patricia',
};

export default async function DashboardPage() {
  const session = await auth();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold">Tableau de bord</h1>
      <p className="mt-2 opacity-70">
        Connecté en tant que <strong>{session?.user?.name}</strong> ({session?.user?.email}).
      </p>
      <form action={logout} className="mt-6">
        <button
          type="submit"
          className="rounded-lg bg-accent px-4 py-2 font-semibold text-ink transition hover:brightness-95"
        >
          Se déconnecter
        </button>
      </form>
    </main>
  );
}

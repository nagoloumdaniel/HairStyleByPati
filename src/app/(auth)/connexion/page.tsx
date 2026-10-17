import type { Metadata } from 'next';
import { LoginForm } from './login-form';

export const metadata: Metadata = {
  title: 'Connexion — Hairstyle by Patricia',
};

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl bg-surface p-8 shadow-lg">
        <h1 className="text-2xl font-semibold">Espace administrateur</h1>
        <p className="mt-1 text-sm opacity-70">Accès réservé à Patricia.</p>
        <div className="mt-6">
          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </div>
    </main>
  );
}

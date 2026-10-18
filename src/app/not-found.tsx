import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <p className="font-heading text-6xl font-bold text-accent">404</p>
      <h1 className="mt-4 font-heading text-3xl font-bold text-ink">Page introuvable</h1>
      <p className="mt-3 max-w-md text-ink-soft">
        Cette page n’existe pas ou n’est plus disponible. Le catalogue reste accessible pour
        découvrir les prestations du salon.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/coiffures"
          className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-accent px-6 py-3 font-semibold text-ink shadow-soft transition hover:bg-accent-hover active:scale-[0.98]"
        >
          Voir le catalogue
        </Link>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-cream-dark bg-surface px-6 py-3 font-semibold text-ink transition hover:border-cacao hover:bg-cream"
        >
          Retour à l’accueil
        </Link>
      </div>
    </main>
  );
}

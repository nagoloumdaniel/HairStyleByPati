import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    'Mentions légales du salon Hairstyle by Patricia : identité, coordonnées, hébergement et publication du site.',
  alternates: { canonical: '/mentions-legales' },
};

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-8 sm:px-6 md:py-12">
      <nav aria-label="Fil d'Ariane" className="text-sm text-ink-soft">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="transition hover:text-cacao">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="font-medium text-ink">
              Mentions légales
            </span>
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cacao">
          Informations légales
        </p>
        <h1 className="font-heading text-4xl font-bold text-ink md:text-5xl">Mentions légales</h1>
        <p className="text-lg leading-relaxed text-ink-soft">
          Identité du salon, coordonnées, hébergement et conditions de publication du site Hairstyle
          by Patricia.
        </p>
      </header>

      <section className="max-w-3xl space-y-8">
        <h2 className="font-heading text-3xl font-bold text-ink">1. Éditeur du site</h2>
        <dl className="space-y-4 text-ink-soft leading-relaxed">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-cream p-6 rounded-xl border border-cream-dark">
              <dt className="font-medium text-ink mb-1">Nom commercial</dt>
              <dd>
                Hairstyle by Patricia — salon de coiffure spécialisé dans les cheveux texturés.
              </dd>
            </div>
            <div className="bg-cream p-6 rounded-xl border border-cream-dark">
              <dt className="font-medium text-ink mb-1">Activité</dt>
              <dd>Coiffures texturées : tresses, vanilles, locs, coiffures protectrices.</dd>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-cream p-6 rounded-xl border border-cream-dark">
              <dt className="font-medium text-ink mb-1">Contact</dt>
              <dd>
                E-mail :
                <a href="mailto:contact@example.com" className="text-cacao underline">
                  contact@example.com
                </a>
              </dd>
            </div>
            <div className="bg-cream p-6 rounded-xl border border-cream-dark">
              <dt className="font-medium text-ink mb-1">SIRET (à compléter)</dt>
              <dd className="text-xs opacity-80">Numéro SIRET à renseigner par le salon.</dd>
            </div>
          </div>
        </dl>
      </section>

      <section className="max-w-3xl space-y-8">
        <h2 className="font-heading text-3xl font-bold text-ink">2. Hébergement</h2>
        <div className="bg-cream p-6 rounded-xl border border-cream-dark">
          <p className="text-ink-soft leading-relaxed">
            Ce site est hébergé sur une plateforme de cloud publique (ex. Vercel ou équivalent). Les
            coordonnées précises de l’hébergeur doivent être renseignées ici par le salon.
          </p>
        </div>
      </section>

      <section className="max-w-3xl space-y-8">
        <h2 className="font-heading text-3xl font-bold text-ink">3. Publication et contenus</h2>
        <p className="text-ink-soft leading-relaxed">
          La directrice de la publication est Patricia, gérante du salon Hairstyle by Patricia. Les
          textes, photos et visuels du site sont la propriété du salon ou utilisés avec
          l’autorisation de leurs auteurs. Toute reproduction est interdite sans accord écrit.
        </p>
      </section>

      <section className="max-w-3xl space-y-8">
        <h2 className="font-heading text-3xl font-bold text-ink">4. Données personnelles</h2>
        <p className="text-ink-soft leading-relaxed">
          Les données collectées via ce site font l’objet d’un traitement décrit dans la{' '}
          <Link href="/confidentialite" className="text-cacao underline font-medium">
            politique de confidentialité
          </Link>
          . Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, de suppression
          et d’opposition sur vos données. Pour exercer ces droits, écrivez à{' '}
          <a href="mailto:contact@example.com" className="text-cacao underline">
            contact@example.com
          </a>
          .
        </p>
      </section>

      <section className="max-w-3xl rounded-2xl bg-cream p-8 text-center md:p-10 border border-cream-dark">
        <h2 className="font-heading text-2xl font-bold text-ink">
          Une question sur ces mentions ?
        </h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">Patricia vous répond personnellement.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent px-6 py-3 font-semibold text-ink shadow-soft transition hover:bg-accent-hover active:scale-[0.98]"
          >
            Nous contacter
          </Link>
          <Link
            href="/coiffures"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-cream-dark bg-surface px-6 py-3 font-semibold text-ink shadow-soft transition hover:border-cacao hover:bg-cream"
          >
            Voir le catalogue
          </Link>
        </div>
      </section>
    </main>
  );
}

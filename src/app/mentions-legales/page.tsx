import type { Metadata } from 'next';
import Link from 'next/link';
import { Title } from '@/components/ui/Title';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description:
    'Mentions légales de Hairstyle by Patricia : identité, coordonnées, hébergement et publication du site.',
  alternates: { canonical: '/mentions-legales' },
};

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-12 px-4 py-8 sm:px-6 md:py-12">
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="transition hover:text-cacao">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="font-medium text-fg">
              Mentions légales
            </span>
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cacao">
          Informations légales
        </p>
        <Title as="h1" size="display" className="">
          Mentions légales
        </Title>
        <p className="text-lg leading-relaxed text-muted">
          Identité, coordonnées, hébergement et conditions de publication du site Hairstyle by
          Patricia.
        </p>
      </header>

      <section className="max-w-3xl space-y-8">
        <Title as="h2" className="">
          1. Éditeur du site
        </Title>
        <dl className="space-y-4 text-muted leading-relaxed">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-page p-6 rounded-xl border border-line">
              <dt className="font-medium text-fg mb-1">Nom commercial</dt>
              <dd>
                Hairstyle by Patricia — coiffure à domicile spécialisée dans les cheveux texturés.
              </dd>
            </div>
            <div className="bg-page p-6 rounded-xl border border-line">
              <dt className="font-medium text-fg mb-1">Activité</dt>
              <dd>Coiffures texturées : tresses, vanilles, locs, coiffures protectrices.</dd>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-page p-6 rounded-xl border border-line">
              <dt className="font-medium text-fg mb-1">Contact</dt>
              <dd>
                E-mail :
                <a href="mailto:contact@example.com" className="text-cacao underline">
                  contact@example.com
                </a>
              </dd>
            </div>
            <div className="bg-page p-6 rounded-xl border border-line">
              <dt className="font-medium text-fg mb-1">SIRET (à compléter)</dt>
              <dd className="text-xs opacity-80">Numéro SIRET à renseigner par Patricia.</dd>
            </div>
          </div>
        </dl>
      </section>

      <section className="max-w-3xl space-y-8">
        <Title as="h2" className="">
          2. Hébergement
        </Title>
        <div className="bg-page p-6 rounded-xl border border-line">
          <p className="text-muted leading-relaxed">
            Ce site est hébergé sur une plateforme de cloud publique (ex. Vercel ou équivalent). Les
            coordonnées précises de l’hébergeur doivent être renseignées ici par Patricia.
          </p>
        </div>
      </section>

      <section className="max-w-3xl space-y-8">
        <Title as="h2" className="">
          3. Publication et contenus
        </Title>
        <p className="text-muted leading-relaxed">
          La directrice de la publication est Patricia, gérante de Hairstyle by Patricia. Les
          textes, photos et visuels du site sont la propriété de Patricia ou utilisés avec
          l’autorisation de leurs auteurs. Toute reproduction est interdite sans accord écrit.
        </p>
      </section>

      <section className="max-w-3xl space-y-8">
        <Title as="h2" className="">
          4. Données personnelles
        </Title>
        <p className="text-muted leading-relaxed">
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

      <section className="max-w-3xl rounded-2xl bg-page p-8 text-center md:p-10 border border-line">
        <Title as="h2" className="">
          Une question sur ces mentions ?
        </Title>
        <p className="mx-auto mt-3 max-w-md text-muted">Patricia vous répond personnellement.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent px-6 py-3 font-semibold text-accent-fg shadow-soft transition hover:bg-accent-hover active:scale-[0.98]"
          >
            Nous contacter
          </Link>
          <Link
            href="/coiffures"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-line bg-card px-6 py-3 font-semibold text-fg shadow-soft transition hover:border-cacao hover:bg-page"
          >
            Voir le catalogue
          </Link>
        </div>
      </section>
    </main>
  );
}

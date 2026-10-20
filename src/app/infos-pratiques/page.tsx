import Link from 'next/link';
import type { Metadata } from 'next';
import { Title } from '@/components/ui/Title';

export const metadata: Metadata = {
  title: 'Informations pratiques',
  description:
    "Horaires, préparation du rendez-vous et politique d'annulation du salon Hairstyle by Patricia.",
  alternates: { canonical: '/infos-pratiques' },
};

const preparation = [
  'Venez avec des cheveux propres, démêlés et séchés.',
  'Si vous portez une coiffure existante (locs, tresses), ne la défaites pas la veille.',
  'Prévoyez une tenue confortable : certaines coiffures demandent plusieurs heures.',
  'Apportez une photo ou une inspiration de la coiffure souhaitée si vous en avez une.',
];

const annulationRules = [
  {
    label: 'Annulation à temps',
    description:
      'Vous pouvez annuler ou déplacer votre rendez-vous gratuitement jusqu’à 24 heures avant l’heure convenue, via le lien sécurisé reçu par e-mail.',
  },
  {
    label: 'Annulation tardive',
    description:
      'Passé le délai de 24 heures, l’annulation est prise en compte mais le créneau ne peut être libéré pour d’autres clientes. Contactez-nous directement pour étudier votre situation.',
  },
  {
    label: 'Absence',
    description:
      'En cas d’absence sans préavis, le salon se réserve le droit de demander un acompte pour toute réservation ultérieure.',
  },
  {
    label: 'Annulation par le salon',
    description:
      'Si Patricia doit annuler pour un motif personnel (maladie, urgence), vous serez contactée sans délai et un nouveau rendez-vous vous sera proposé en priorité, sans frais.',
  },
];

export default function InfosPratiquesPage() {
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
              Informations pratiques
            </span>
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cacao">Pratique</p>
        <Title as="h1" size="display" className="">
          Informations pratiques
        </Title>
        <p className="text-lg leading-relaxed text-muted">
          Tout ce qu&apos;il faut savoir avant votre venue : horaires, préparation du rendez-vous et
          conditions d&apos;annulation.
        </p>
      </header>

      {/* Coordonnées et horaires */}
      <section className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <div className="space-y-6 rounded-2xl bg-card p-8 shadow-soft">
          <Title as="h2" className="">
            Coordonnées
          </Title>
          <p className="text-muted">
            <span className="font-semibold text-fg">Adresse</span>
            <br />
            12 Rue de la Coiffure
            <br />
            Dakar, Sénégal
          </p>
          <p className="text-muted">
            <span className="font-semibold text-fg">Téléphone</span>
            <br />
            01 23 45 67 89
          </p>
          <p className="text-muted">
            <span className="font-semibold text-fg">E-mail</span>
            <br />
            contact@hairstylebypati.fr
          </p>
        </div>
        <div className="space-y-6 rounded-2xl bg-card p-8 shadow-soft">
          <Title as="h2" className="">
            Horaires
          </Title>
          <p className="text-muted">
            Mardi – Samedi : 10h – 19h
            <br />
            Fermé dimanche et lundi
          </p>
          <p className="text-muted">
            Les rendez-vous sont strictement sur réservation. Merci de respecter l&apos;heure
            convenue : chaque retard réduit le temps de votre prestation.
          </p>
        </div>
      </section>

      {/* Préparation */}
      <section className="space-y-6">
        <Title as="h2" className="">
          Préparer votre rendez-vous
        </Title>
        <ul className="max-w-3xl space-y-3">
          {preparation.map((item) => (
            <li key={item} className="flex items-start gap-3 text-muted">
              <span aria-hidden="true" className="mt-1 font-bold text-accent">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Politique d'annulation */}
      <section className="space-y-6">
        <Title as="h2" className="">
          Politique d&apos;annulation
        </Title>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {annulationRules.map((rule) => (
            <div key={rule.label} className="border-l-4 border-accent pl-5">
              <h3 className="font-heading text-xl font-bold text-fg">{rule.label}</h3>
              <p className="mt-1 leading-relaxed text-muted">{rule.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl bg-page p-8 text-center md:p-10">
        <Title as="h2" className="">
          Une question ?
        </Title>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Pour toute demande particulière (groupe, coiffure sur mesure, situation particulière),
          contactez-nous avant de réserver.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent px-6 py-3 font-semibold text-accent-fg shadow-soft transition hover:bg-accent-hover active:scale-[0.98]"
          >
            Nous contacter
          </Link>
          <Link
            href="/reserver"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-line bg-card px-6 py-3 font-semibold text-fg shadow-soft transition hover:border-cacao hover:bg-page"
          >
            Réserver un créneau
          </Link>
        </div>
      </section>
    </main>
  );
}

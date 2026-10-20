import Image from 'next/image';
import { IMAGE_BLUR_DATA_URL } from '@/lib/image-placeholder';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Title } from '@/components/ui/Title';

export const metadata: Metadata = {
  title: 'Le salon',
  description:
    'Découvrez Hairstyle by Patricia : un salon à taille humaine spécialisé en tresses, vanilles et locs, avec un diagnostic capillaire sur mesure.',
  alternates: { canonical: '/salon' },
};

const values = [
  {
    title: 'Écoute',
    description: 'Votre avis compte à chaque étape, du premier diagnostic au résultat final.',
  },
  {
    title: 'Ponctualité',
    description: "Les rendez-vous sont planifiés à la minute : pas d'attente inutile.",
  },
  {
    title: 'Bienveillance',
    description: "Un espace sans jugement où l'on parle cheveux librement.",
  },
  {
    title: 'Exigence',
    description:
      'Des produits de qualité et un geste précis pour préserver la santé de vos cheveux.',
  },
];

const approach = [
  {
    number: '1',
    title: 'Diagnostic capillaire',
    description:
      'Avant toute coiffure, nous évaluons la nature de vos cheveux, leur porosité et leur état de santé. Ce premier échange détermine les coiffures qui vous conviennent vraiment.',
  },
  {
    number: '2',
    title: 'Création sur mesure',
    description:
      'Chaque prestation est réalisée à la main, sans précipitation. La longueur, la tension et le motif sont adaptés à votre morphologie et à votre mode de vie.',
  },
  {
    number: '3',
    title: "Conseils d'entretien",
    description:
      "À la fin du rendez-vous, vous repartez avec une routine d'entretien personnalisée pour garder votre coiffure plus longtemps.",
  },
];

export default function SalonPage() {
  return (
    <main className="mx-auto w-full max-w-7xl space-y-16 px-4 py-8 sm:px-6 md:py-12">
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
              Le salon
            </span>
          </li>
        </ol>
      </nav>

      {/* Introduction : photo de Patricia à gauche, texte à droite */}
      <section className="flex flex-col items-center gap-10 md:flex-row md:items-start">
        <div className="flex justify-center md:w-2/5">
          <Image
            src="https://images.pexels.com/photos/10825829/pexels-photo-10825829.jpeg?auto=compress&cs=tinysrgb&w=700"
            alt="Portrait de démonstration — Patricia, coiffeuse experte en tresses, vanilles et locs"
            className="rounded-full shadow-lift ring-4 ring-accent-soft"
            width={360}
            height={360}
            sizes="(max-width: 768px) 80vw, 40vw"
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            quality={80}
            priority
          />
        </div>
        <div className="space-y-6 md:w-3/5">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cacao">Le salon</p>
          <Title as="h1" size="display" className="">
            Un salon à taille humaine, un savoir-faire sur mesure
          </Title>
          <p className="text-lg leading-relaxed text-muted">
            Depuis plus de dix ans, Patricia accueille sa clientèle dans un espace chaleureux dédié
            aux cheveux texturés : tresses, vanilles, locs et coiffures protectrices. Ici, chaque
            rendez-vous commence par un vrai diagnostic capillaire.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/reserver"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent px-6 py-3 font-semibold text-accent-fg shadow-soft transition hover:bg-accent-hover active:scale-[0.98]"
            >
              Prendre rendez-vous
            </Link>
            <Link
              href="/coiffures"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-line bg-card px-6 py-3 font-semibold text-fg shadow-soft transition hover:border-cacao hover:bg-page"
            >
              Voir le catalogue
            </Link>
          </div>
        </div>
      </section>

      {/* Histoire */}
      <section className="max-w-3xl space-y-6">
        <Title as="h2" className="">
          Notre histoire
        </Title>
        <p className="leading-relaxed text-muted">
          Patricia s&apos;est formée auprès de coiffeuses expertes des cheveux africains avant
          d&apos;ouvrir son propre salon. L&apos;idée était simple : offrir un lieu où l&apos;on
          prend le temps, le temps d&apos;écouter, de comprendre la nature de vos cheveux, puis de
          créer la coiffure qui vous ressemble.
        </p>
        <p className="leading-relaxed text-muted">
          Le salon a grandi par le bouche-à-oreille. Aujourd&apos;hui, certaines clientes viennent
          depuis l&apos;ouverture, et d&apos;autres font le déplacement pour une tresse BOX ou un
          rétissage de locs.
        </p>
      </section>

      {/* Approche en 3 étapes */}
      <section className="space-y-8">
        <Title as="h2" className="">
          Une approche sur mesure
        </Title>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {approach.map((step) => (
            <div key={step.number} className="border-t-2 border-accent pt-5">
              <div
                aria-hidden="true"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent font-heading text-xl font-bold text-accent-fg"
              >
                {step.number}
              </div>
              <h3 className="mt-4 font-heading text-xl font-bold text-fg">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Valeurs : liste à bordure gauche, pas de cartes génériques */}
      <section className="space-y-8">
        <Title as="h2" className="">
          Nos valeurs
        </Title>
        <dl className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {values.map((value) => (
            <div key={value.title} className="border-l-4 border-accent pl-5">
              <dt className="font-heading text-xl font-bold text-fg">{value.title}</dt>
              <dd className="mt-1 leading-relaxed text-muted">{value.description}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Infos pratiques (aperçu) */}
      <section className="rounded-2xl bg-page p-8 md:p-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <Title as="h2" className="">
              Horaires
            </Title>
            <p className="mt-3 text-muted">
              Mardi – Samedi : 10h – 19h
              <br />
              Fermé dimanche et lundi
            </p>
          </div>
          <div>
            <Title as="h2" className="">
              Adresse
            </Title>
            <p className="mt-3 text-muted">
              12 Rue de la Coiffure
              <br />
              Dakar, Sénégal
            </p>
          </div>
          <div className="flex items-center">
            <Link
              href="/infos-pratiques"
              className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent px-6 py-3 font-semibold text-accent-fg shadow-soft transition hover:bg-accent-hover active:scale-[0.98]"
            >
              Toutes les infos pratiques
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

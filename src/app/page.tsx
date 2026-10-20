import { ArrowRight, CalendarDays, Clock, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';

import { getApprovedReviews } from '@/modules/avis/queries';
import { Title } from '@/components/ui/Title';
import { PrestationCard } from '@/components/catalogue/PrestationCard';
import { bookingHref } from '@/lib/catalogue';

export const metadata: Metadata = {
  title: { absolute: 'Hairstyle by Patricia — Locs, nattes collées et vanilles à Dakar' },
  description:
    'Départ et retwist de locs, nattes collées, vanilles. Coiffure à domicile à Dakar, diagnostic capillaire et réservation en ligne.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Hairstyle by Patricia — Locs, nattes collées et vanilles à Dakar',
    description:
      'Départ et retwist de locs, nattes collées, vanilles. Prenez rendez-vous en quelques clics.',
    type: 'website',
    url: '/',
  },
};

const popularServices = [
  {
    title: 'Tresses BOX',
    slug: 'tresses-box',
    price: 'À partir de 20 000 FCFA',
    duration: '3h00',
    category: 'Tresses',
    image:
      'https://images.pexels.com/photos/36441633/pexels-photo-36441633.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Tresses BOX — coiffure protectrice (photo de démonstration)',
  },
  {
    title: 'Vanilles légères',
    slug: 'vanilles-legeres',
    price: 'À partir de 15 000 FCFA',
    duration: '2h30',
    category: 'Vanilles',
    image:
      'https://images.pexels.com/photos/37547660/pexels-photo-37547660.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Vanilles légères — coiffure protectrice (photo de démonstration)',
  },
  {
    title: 'Rétissage de locs',
    slug: 'retissage-de-locs',
    price: 'À partir de 25 000 FCFA',
    duration: '2h00',
    category: 'Locs',
    image:
      'https://images.pexels.com/photos/30152002/pexels-photo-30152002.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Rétissage de locs — entretien (photo de démonstration)',
  },
];

const steps = [
  {
    number: '1',
    title: 'Choisissez votre coiffure',
    description: 'Parcourez le catalogue et sélectionnez la prestation adaptée à vos envies.',
  },
  {
    number: '2',
    title: 'Vérifiez la compatibilité',
    description:
      'Répondez aux questions capillaires pour valider que la coiffure convient à vos cheveux.',
  },
  {
    number: '3',
    title: 'Réservez votre créneau',
    description:
      "Choisissez la date et l'heure qui vous conviennent et confirmez votre rendez-vous.",
  },
];

export default async function HomePage() {
  const reviews = await getApprovedReviews(3);
  return (
    <main>
      {/* Hero plein écran : texte à gauche, portrait arrondi à droite avec petites cartes
          qui débordent du cadre (pas de fond blanc). Navbar flottante intacte. */}
      <section
        aria-labelledby="hero-title"
        className="landing-hero relative -mt-[4.75rem] min-h-svh overflow-hidden bg-hero md:-mt-24 lg:h-svh lg:min-h-[40rem]"
      >
        <div className="mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-10 px-6 pb-12 pt-32 sm:px-10 md:pt-36 lg:grid-cols-2 lg:gap-8 lg:pb-8 lg:pt-28">
          {/* Texte + actions */}
          <div className="flex flex-col items-center gap-5 text-center lg:items-start lg:text-left">
            <Title as="h1" size="display" id="hero-title" className="landing-title title-on-dark">
              Hairstyle by Patricia
            </Title>
            <p className="reveal max-w-xl text-lg text-panel-fg/85 md:text-xl">
              Départ et retwist de locs, nattes collées, vanilles.
            </p>
            <div
              className="reveal flex w-full max-w-md flex-row gap-3 lg:max-w-xl"
              style={{ animationDelay: '200ms' }}
            >
              <Link
                href="/coiffures"
                className="bg-gradient-primary inline-flex flex-1 items-center justify-center gap-2 rounded-full px-7 py-4 text-lg font-bold text-accent-fg shadow-soft transition hover:brightness-110 active:scale-[0.98]"
              >
                <CalendarDays aria-hidden="true" className="size-5" />
                Réserver
              </Link>
              <Link
                href="/coiffures"
                className="inline-flex border border-white/20 bg-white/10 backdrop-blur-md flex-1 items-center justify-center gap-2 rounded-full px-7 py-4 text-lg font-bold text-panel-fg transition hover:bg-white/10 active:scale-[0.98]"
              >
                Catalogue
                <ArrowRight aria-hidden="true" className="size-5" />
              </Link>
            </div>
          </div>

          {/* Portrait dans un cercle qui se déforme en continu */}
          <div
            className="reveal relative mx-auto flex w-full max-w-[20rem] justify-center sm:max-w-[26rem] lg:max-w-none lg:justify-end lg:pr-10"
            style={{ animationDelay: '120ms' }}
          >
            <div className="landing-blob-ring relative aspect-square w-full max-w-[26rem] lg:h-[min(72svh,36rem)] lg:w-auto lg:max-w-none">
              <div className="landing-blob relative size-full shadow-lift">
                <Image
                  src="/landing/landing.jpeg"
                  alt="Patricia coiffe un client : retwist de locs et nattes collées"
                  fill
                  priority
                  quality={90}
                  sizes="(max-width: 1024px) 26rem, 36rem"
                  className="object-cover object-[62%_30%]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="page-main space-y-20">
        {/* Coiffures populaires */}
        <section id="coiffures" className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <Title as="h2" className="">
                Coiffures populaires
              </Title>
              <p className="text-muted">Nos prestations les plus demandées.</p>
            </div>
            <Link
              href="/coiffures"
              className="inline-flex items-center justify-center gap-2 font-semibold bg-accent text-accent-fg hover:bg-accent-hover shadow-soft px-7 py-3.5 text-lg rounded-[var(--radius-md)] transition active:scale-[0.98]"
            >
              Voir toutes les coiffures
            </Link>
          </div>
          <ul
            aria-label="Coiffures populaires"
            className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {popularServices.slice(0, 6).map((service) => (
              <li key={service.slug}>
                <PrestationCard
                  href={`/coiffures/${service.slug}`}
                  bookHref={bookingHref(service.slug)}
                  images={[{ src: service.image, alt: service.alt }]}
                  badge={service.category}
                  title={service.title}
                  price={service.price}
                  duration={service.duration}
                />
              </li>
            ))}
          </ul>
        </section>

        {/* Étapes de réservation */}
        <section id="etapes" className="space-y-8">
          <Title as="h2" className="">
            Comment ça marche
          </Title>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-fg font-heading font-bold text-xl mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-heading font-bold text-fg mb-2">{step.title}</h3>
                <p className="text-muted leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Présentation Patricia */}
        <section id="patricia" className="reveal mx-auto max-w-3xl space-y-6 text-center">
          <Title as="h2" className="">
            À propos de Patricia
          </Title>
          <p className="text-muted leading-relaxed">
            Moi, c&apos;est Patricia. Depuis novembre 2025, je coiffe les cheveux naturels : locs et
            nattes collées, pour les hommes comme pour les femmes. J&apos;ai tout appris seule, à
            force de pratique, et j&apos;ai déjà coiffé plus de 40 clients.
          </p>
          <p className="text-muted leading-relaxed">
            Chez moi, on mise sur la rapidité, une belle finition, la bonne humeur et votre confort.
            Avant de commencer, on regarde ensemble votre nature de cheveux pour choisir la coiffure
            qui vous va.
          </p>
          <p className="font-heading text-xl font-bold text-fg">
            Si vous êtes content, je le suis aussi.
          </p>
        </section>

        {/* Témoignages (P8.10) : avis réels approuvés uniquement, jamais inventés. */}
        {reviews.length > 0 ? (
          <section id="temoinages" className="space-y-8">
            <Title as="h2" className="">
              Elles nous font confiance
            </Title>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <blockquote
                  key={review.id}
                  className="card p-6 italic text-muted border-none bg-card shadow-soft"
                >
                  {review.comment ? <p className="text-lg mb-4">« {review.comment} »</p> : null}
                  <footer className="text-sm font-semibold text-fg not-italic">
                    — {review.customer.name.split(' ')[0]} · {review.service.name}
                    {review.rating ? ` · ${review.rating}/5` : ''}
                  </footer>
                </blockquote>
              ))}
            </div>
          </section>
        ) : null}

        {/* Demande personnalisée */}
        <section className="rounded-2xl border border-line bg-card p-8 text-center shadow-soft md:p-12">
          <Title as="h2" className="">
            Une coiffure sur mesure en tête ?
          </Title>
          <p className="mx-auto mt-3 max-w-2xl text-ink-soft">
            Décrivez votre projet et joignez jusqu’à trois photos de référence. Patricia étudie
            votre demande et vous propose une prestation adaptée, sans réservation automatique.
          </p>
          <Link
            href="/demandes-personnalisees"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] bg-accent px-7 py-3.5 text-lg font-semibold text-accent-fg shadow-soft transition hover:bg-accent-hover active:scale-[0.98]"
          >
            Demander une coiffure personnalisée
          </Link>
        </section>

        {/* Contact / Coordonnées */}
        <section id="contact" className="rounded-2xl bg-page p-8 md:p-12 reveal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <Title as="h2" className="">
                Contactez-nous
              </Title>
              <p className="text-muted leading-relaxed">
                Une question sur une prestation ou sur la disponibilité d&apos;un créneau ?
                Contactez-nous, nous vous répondrons rapidement.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 font-semibold bg-accent text-accent-fg hover:bg-accent-hover shadow-soft px-7 py-3.5 text-lg rounded-[var(--radius-md)] transition active:scale-[0.98]"
              >
                Envoyer un message
              </Link>
            </div>
            <div className="space-y-4">
              <p className="flex items-start gap-3 text-fg">
                <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>
                  Hairstyle by Patricia
                  <br />
                  Ouest - Foire, Dakar, Sénégal
                </span>
              </p>
              <p className="flex items-start gap-3 text-fg">
                <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>zepatricia7@gmail.com</span>
              </p>
              <p className="flex items-start gap-3 text-fg">
                <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                <span>Lundi – Dimanche : 5h – 22h</span>
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

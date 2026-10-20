import { Clock, Mail, MapPin } from 'lucide-react';
import Image from 'next/image';
import { IMAGE_BLUR_DATA_URL } from '@/lib/image-placeholder';
import Link from 'next/link';
import type { Metadata } from 'next';

import { getApprovedReviews } from '@/modules/avis/queries';
import { Title } from '@/components/ui/Title';
import { PrestationCard } from '@/components/catalogue/PrestationCard';
import { bookingHref } from '@/lib/catalogue';

export const metadata: Metadata = {
  title: 'Hairstyle by Patricia — Coiffures texturées, tresses, vanilles et locs à Dakar',
  description:
    'Coiffure à domicile spécialisée en tresses, vanilles et locs. Diagnostic capillaire sur mesure et réservation en ligne. Dakar, Sénégal.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Hairstyle by Patricia — Sublimez vos cheveux avec Patricia',
    description:
      'Coiffeuse spécialisée en tresses, vanilles et locs. Prenez rendez-vous en quelques clics pour une coiffure sur mesure.',
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
    <main className="page-main space-y-20">
      {/* Hero */}
      <section
        className="relative rounded-2xl bg-hero p-8 md:p-16 text-panel-fg overflow-hidden reveal"
        aria-labelledby="hero-title"
      >
        <div className="md:flex md:items-center gap-8">
          <div className="md:w-1/2 space-y-6">
            <Title as="h1" size="display" id="hero-title" className="title-on-dark">
              Sublimez vos cheveux avec Patricia
            </Title>
            <p className="text-lg md:text-xl text-panel-fg/90 max-w-md leading-relaxed">
              Coiffeuse spécialisée en tresses, vanilles et locs. Prenez rendez-vous en quelques
              clics pour une coiffure sur mesure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/reserver"
                className="inline-flex items-center justify-center gap-2 font-semibold bg-accent text-accent-fg hover:bg-accent-hover shadow-soft px-7 py-3.5 text-lg rounded-[var(--radius-md)] transition active:scale-[0.98]"
              >
                Réserver un créneau
              </Link>
              <Link
                href="/coiffures"
                className="inline-flex items-center justify-center gap-2 font-semibold bg-card text-fg border border-line hover:border-cacao shadow-soft px-7 py-3.5 text-lg rounded-[var(--radius-md)] transition active:scale-[0.98]"
              >
                Découvrir le catalogue
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <Image
              src="https://images.pexels.com/photos/33664383/pexels-photo-33664383.jpeg?auto=compress&cs=tinysrgb&w=900"
              alt="Coiffure tressée réalisée à domicile (photo de démonstration)"
              className="rounded-xl shadow-lift"
              width={600}
              height={600}
              sizes="(max-width: 768px) 100vw, 45vw"
              placeholder="blur"
              blurDataURL={IMAGE_BLUR_DATA_URL}
              quality={80}
              priority
            />
          </div>
        </div>
      </section>

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
      <section id="patricia" className="flex flex-col md:flex-row gap-12 items-center reveal">
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="https://images.pexels.com/photos/10825829/pexels-photo-10825829.jpeg?auto=compress&cs=tinysrgb&w=700"
            alt="Portrait de démonstration — coiffeuse experte en tresses, vanilles et locs"
            className="rounded-full shadow-lift"
            width={500}
            height={500}
            sizes="(max-width: 768px) 80vw, 40vw"
            placeholder="blur"
            blurDataURL={IMAGE_BLUR_DATA_URL}
            quality={80}
            loading="lazy"
          />
        </div>
        <div className="md:w-1/2 space-y-6">
          <Title as="h2" className="">
            À propos de Patricia
          </Title>
          <p className="text-muted leading-relaxed">
            Coiffeuse passionnée et expérimentée, Patricia met son savoir-faire au service de vos
            cheveux depuis plus de 10 ans. Spécialiste des tresses, vanilles et locs, elle vous
            accueille dans une ambiance chaleureuse et professionnelle pour sublimer votre
            chevelure.
          </p>
          <p className="text-muted leading-relaxed">
            Chaque prestation est personnalisée : diagnostic capillaire, conseils d&apos;entretien
            et coiffure adaptée à votre nature de cheveux.
          </p>
        </div>
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
          Décrivez votre projet et joignez jusqu’à trois photos de référence. Patricia étudie votre
          demande et vous propose une prestation adaptée, sans réservation automatique.
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
                Dakar, Sénégal
              </span>
            </p>
            <p className="flex items-start gap-3 text-fg">
              <Mail aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>zepatricia7@gmail.com</span>
            </p>
            <p className="flex items-start gap-3 text-fg">
              <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
              <span>Mardi – Samedi : 10h – 19h</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

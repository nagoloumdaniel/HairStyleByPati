import Image from 'next/image';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = {
  title: 'Hairstyle by Patricia — Coiffures texturées, tresses, vanilles et locs à Paris',
  description:
    'Salon de coiffure spécialisé en tresses, vanilles et locs. Diagnostic capillaire sur mesure et réservation en ligne. Paris 12e.',
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
    price: 'À partir de 80 €',
    duration: '3h00',
    category: 'Tresses',
    image:
      'https://images.pexels.com/photos/36441633/pexels-photo-36441633.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Tresses BOX — coiffure protectrice (photo de démonstration)',
  },
  {
    title: 'Vanilles légères',
    slug: 'vanilles-legeres',
    price: 'À partir de 60 €',
    duration: '2h30',
    category: 'Vanilles',
    image:
      'https://images.pexels.com/photos/37547660/pexels-photo-37547660.jpeg?auto=compress&cs=tinysrgb&w=800',
    alt: 'Vanilles légères — coiffure protectrice (photo de démonstration)',
  },
  {
    title: 'Rétissage de locs',
    slug: 'retissage-de-locs',
    price: 'À partir de 100 €',
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

export default function HomePage() {
  return (
    <main className="mx-auto max-w-7xl px-6 space-y-20">
      {/* Hero */}
      <section
        className="relative rounded-2xl bg-hero p-8 md:p-16 text-panel-fg overflow-hidden reveal"
        aria-labelledby="hero-title"
      >
        <div className="md:flex md:items-center gap-8">
          <div className="md:w-1/2 space-y-6">
            <h1
              id="hero-title"
              className="text-4xl md:text-6xl font-heading font-bold leading-tight"
            >
              Sublimez vos cheveux
              <br />
              avec Patricia
            </h1>
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
              alt="Coiffure tressée réalisée en salon (photo de démonstration)"
              className="rounded-xl shadow-lift"
              width={600}
              height={600}
              priority
            />
          </div>
        </div>
      </section>

      {/* Coiffures populaires */}
      <section id="coiffures" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-heading font-bold text-fg">Coiffures populaires</h2>
            <p className="text-muted">Nos prestations les plus demandées.</p>
          </div>
          <Link
            href="/coiffures"
            className="inline-flex items-center justify-center gap-2 font-semibold bg-accent text-accent-fg hover:bg-accent-hover shadow-soft px-7 py-3.5 text-lg rounded-[var(--radius-md)] transition active:scale-[0.98]"
          >
            Voir toutes les coiffures
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularServices.map((service) => (
            <Card
              key={service.title}
              className="overflow-hidden shadow-soft hover:shadow-lift transition-shadow"
            >
              <Image
                src={service.image}
                alt={service.alt}
                className="w-full h-48 object-cover"
                width={400}
                height={300}
                loading="lazy"
              />
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <Badge tone="neutral">{service.category}</Badge>
                  <Badge tone="accent">{service.price}</Badge>
                </div>
                <h3 className="text-xl font-heading font-bold text-fg mb-1">{service.title}</h3>
                <p className="text-muted text-sm mb-4">{service.duration}</p>
                <Link
                  href={`/coiffures/${service.slug}`}
                  className="inline-flex items-center justify-center gap-2 font-semibold bg-accent text-accent-fg hover:bg-accent-hover shadow-soft px-3 py-1.5 text-sm rounded-[var(--radius-sm)] transition active:scale-[0.98]"
                >
                  Voir les détails
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Étapes de réservation */}
      <section id="etapes" className="space-y-8">
        <h2 className="text-3xl font-heading font-bold text-fg">Comment ça marche</h2>
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
            loading="lazy"
          />
        </div>
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-3xl font-heading font-bold text-fg">À propos de Patricia</h2>
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

      {/* Témoignages */}
      <section id="temoinages" className="space-y-8">
        <h2 className="text-3xl font-heading font-bold text-fg">Elles nous font confiance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <blockquote className="card p-6 italic text-muted border-none bg-card shadow-soft">
            <p className="text-lg mb-4">
              « Des tresses magnifiques, tenu parfait pendant 4 semaines. »
            </p>
            <footer className="text-sm font-semibold text-fg">— Marie L.</footer>
          </blockquote>
          <blockquote className="card p-6 italic text-muted border-none bg-card shadow-soft">
            <p className="text-lg mb-4">
              « Accueil chaleureux, Patricia prend le temps de comprendre ce qu&apos;on veut. »
            </p>
            <footer className="text-sm font-semibold text-fg">— Sophie R.</footer>
          </blockquote>
          <blockquote className="card p-6 italic text-muted border-none bg-card shadow-soft">
            <p className="text-lg mb-4">
              « Mes locs n&apos;ont jamais été aussi bien entretenus. Merci Patricia ! »
            </p>
            <footer className="text-sm font-semibold text-fg">— Aïcha D.</footer>
          </blockquote>
        </div>
      </section>

      {/* Demande personnalisée */}
      <section className="rounded-2xl border border-line bg-card p-8 text-center shadow-soft md:p-12">
        <h2 className="font-heading text-3xl font-bold text-fg">
          Une coiffure sur mesure en tête ?
        </h2>
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
            <h2 className="text-3xl font-heading font-bold text-fg">Contactez-nous</h2>
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
              <span className="text-accent font-bold">📍</span>
              <span>
                Salon Hairstyle by Patricia
                <br />
                12 Rue de la Coiffure, 75000 Paris
              </span>
            </p>
            <p className="flex items-start gap-3 text-fg">
              <span className="text-accent font-bold">📞</span>
              <span>01 23 45 67 89</span>
            </p>
            <p className="flex items-start gap-3 text-fg">
              <span className="text-accent font-bold">✉️</span>
              <span>contact@hairstylebypati.fr</span>
            </p>
            <p className="flex items-start gap-3 text-fg">
              <span className="text-accent font-bold">🕒</span>
              <span>Mardi – Samedi : 10h – 19h</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

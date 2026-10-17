import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

const popularServices = [
  {
    title: 'Tresses BOX',
    price: 'À partir de 80 €',
    duration: '3h00',
    category: 'Tresses',
    image: 'https://images.unsplash.com/photo-1522337457743-1e9770e33e3e?w=800&q=80',
    alt: 'Tresses BOX — coiffure protectrice',
  },
  {
    title: 'Vanilles légères',
    price: 'À partir de 60 €',
    duration: '2h30',
    category: 'Vanilles',
    image: 'https://images.unsplash.com/photo-1559256709-5bb6d2e0d3a4?w=800&q=80',
    alt: 'Vanilles légères — coiffure protectrice',
  },
  {
    title: 'Locs retissage',
    price: 'À partir de 100 €',
    duration: '2h00',
    category: 'Locs',
    image: 'https://images.unsplash.com/photo-1519239528316-1e8d6058a9b6?w=800&q=80',
    alt: 'Locs retissage — coiffure protectrice',
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
        className="relative rounded-2xl bg-cacao p-8 md:p-16 text-surface overflow-hidden reveal"
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
            <p className="text-lg md:text-xl text-ink-soft max-w-md leading-relaxed">
              Coiffeuse spécialisée en tresses, vanilles et locs. Prenez rendez-vous en quelques
              clics pour une coiffure sur mesure.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/reserver"
                className="inline-flex items-center justify-center gap-2 font-semibold bg-accent text-ink hover:bg-accent-hover shadow-soft px-7 py-3.5 text-lg rounded-[var(--radius-md)] transition active:scale-[0.98]"
              >
                Réserver un créneau
              </a>
              <a
                href="/coiffures"
                className="inline-flex items-center justify-center gap-2 font-semibold bg-surface text-ink border border-cream-dark hover:border-cacao shadow-soft px-7 py-3.5 text-lg rounded-[var(--radius-md)] transition active:scale-[0.98]"
              >
                Découvrir le catalogue
              </a>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1556740734-67e7766542d6?w=600&q=80"
              alt="Patricia coiffeuse — salon de coiffure afro"
              className="rounded-xl shadow-lift"
              width={600}
              height={600}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </section>

      {/* Coiffures populaires */}
      <section id="coiffures" className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-heading font-bold text-ink">Coiffures populaires</h2>
            <p className="text-ink-soft">Nos prestations les plus demandées.</p>
          </div>
          <a
            href="/coiffures"
            className="inline-flex items-center justify-center gap-2 font-semibold bg-accent text-ink hover:bg-accent-hover shadow-soft px-7 py-3.5 text-lg rounded-[var(--radius-md)] transition active:scale-[0.98]"
          >
            Voir toutes les coiffures
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {popularServices.map((service) => (
            <Card
              key={service.title}
              className="overflow-hidden shadow-soft hover:shadow-lift transition-shadow"
            >
              <img
                src={service.image}
                alt={service.alt}
                className="w-full h-48 object-cover"
                width={400}
                height={300}
                loading="lazy"
                decoding="async"
              />
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <Badge tone="neutral">{service.category}</Badge>
                  <Badge tone="accent">{service.price}</Badge>
                </div>
                <h3 className="text-xl font-heading font-bold text-ink mb-1">{service.title}</h3>
                <p className="text-ink-soft text-sm mb-4">{service.duration}</p>
                <a
                  href={`/coiffures/${service.title.toLowerCase().replace(/\s+/g, '-')}`}
                  className="inline-flex items-center justify-center gap-2 font-semibold bg-accent text-ink hover:bg-accent-hover shadow-soft px-3 py-1.5 text-sm rounded-[var(--radius-sm)] transition active:scale-[0.98]"
                >
                  Voir les détails
                </a>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Étapes de réservation */}
      <section id="etapes" className="space-y-8">
        <h2 className="text-3xl font-heading font-bold text-ink">Comment ça marche</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-accent text-ink font-heading font-bold text-xl mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-heading font-bold text-ink mb-2">{step.title}</h3>
              <p className="text-ink-soft leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Présentation Patricia */}
      <section id="patricia" className="flex flex-col md:flex-row gap-12 items-center reveal">
        <div className="md:w-1/2 flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80"
            alt="Patricia — coiffeuse experte en tresses, vanilles et locs"
            className="rounded-full shadow-lift"
            width={500}
            height={500}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-3xl font-heading font-bold text-ink">À propos de Patricia</h2>
          <p className="text-ink-soft leading-relaxed">
            Coiffeuse passionnée et expérimentée, Patricia met son savoir-faire au service de vos
            cheveux depuis plus de 10 ans. Spécialiste des tresses, vanilles et locs, elle vous
            accueille dans une ambiance chaleureuse et professionnelle pour sublimer votre
            chevelure.
          </p>
          <p className="text-ink-soft leading-relaxed">
            Chaque prestation est personnalisée : diagnostic capillaire, conseils d&apos;entretien
            et coiffure adaptée à votre nature de cheveux.
          </p>
        </div>
      </section>

      {/* Témoignages */}
      <section id="temoinages" className="space-y-8">
        <h2 className="text-3xl font-heading font-bold text-ink">Elles nous font confiance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <blockquote className="card p-6 italic text-ink-soft border-none bg-surface shadow-soft">
            <p className="text-lg mb-4">
              « Des tresses magnifiques, tenu parfait pendant 4 semaines. »
            </p>
            <footer className="text-sm font-semibold text-ink">— Marie L.</footer>
          </blockquote>
          <blockquote className="card p-6 italic text-ink-soft border-none bg-surface shadow-soft">
            <p className="text-lg mb-4">
              « Accueil chaleureux, Patricia prend le temps de comprendre ce qu&apos;on veut. »
            </p>
            <footer className="text-sm font-semibold text-ink">— Sophie R.</footer>
          </blockquote>
          <blockquote className="card p-6 italic text-ink-soft border-none bg-surface shadow-soft">
            <p className="text-lg mb-4">
              « Mes locs n&apos;ont jamais été aussi bien entretenus. Merci Patricia ! »
            </p>
            <footer className="text-sm font-semibold text-ink">— Aïcha D.</footer>
          </blockquote>
        </div>
      </section>

      {/* Contact / Coordonnées */}
      <section id="contact" className="rounded-2xl bg-cream p-8 md:p-12 reveal">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <h2 className="text-3xl font-heading font-bold text-ink">Contactez-nous</h2>
            <p className="text-ink-soft leading-relaxed">
              Une question sur une prestation ou sur la disponibilité d&apos;un créneau ?
              Contactez-nous, nous vous répondrons rapidement.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center gap-2 font-semibold bg-accent text-ink hover:bg-accent-hover shadow-soft px-7 py-3.5 text-lg rounded-[var(--radius-md)] transition active:scale-[0.98]"
            >
              Envoyer un message
            </a>
          </div>
          <div className="space-y-4">
            <p className="flex items-start gap-3 text-ink">
              <span className="text-accent font-bold">📍</span>
              <span>
                Salon Hairstyle by Patricia
                <br />
                12 Rue de la Coiffure, 75000 Paris
              </span>
            </p>
            <p className="flex items-start gap-3 text-ink">
              <span className="text-accent font-bold">📞</span>
              <span>01 23 45 67 89</span>
            </p>
            <p className="flex items-start gap-3 text-ink">
              <span className="text-accent font-bold">✉️</span>
              <span>contact@hairstylebypati.fr</span>
            </p>
            <p className="flex items-start gap-3 text-ink">
              <span className="text-accent font-bold">🕒</span>
              <span>Mardi – Samedi : 10h – 19h</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

import { Check } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { Title } from '@/components/ui/Title';
import { formatOpeningHours } from '@/modules/parametres/hours';
import { getCachedSalonSettings } from '@/lib/public-cache';
import { DEFAULT_SALON_SETTINGS, type SalonSettingsData } from '@/modules/disponibilites/queries';
import { resolveBookingPolicy, splitParagraphs } from '@/modules/parametres/policies';

export const metadata: Metadata = {
  title: 'Informations pratiques',
  description:
    "Horaires, préparation du rendez-vous et politique d'annulation de Hairstyle by Patricia.",
  alternates: { canonical: '/infos-pratiques' },
};

const preparation = [
  'Venez avec des cheveux propres, démêlés et séchés.',
  'Si vous portez une coiffure existante (locs, tresses), ne la défaites pas la veille.',
  'Prévoyez une tenue confortable : certaines coiffures demandent plusieurs heures.',
  'Apportez une photo ou une inspiration de la coiffure souhaitée si vous en avez une.',
];

function buildCancellationRules(hours: number) {
  const delay = hours > 0 ? `${hours} heures` : 'le délai prévu';
  return [
    {
      label: 'Annulation à temps',
      description: `Vous pouvez annuler ou déplacer votre rendez-vous gratuitement jusqu’à ${delay} avant l’heure convenue, via le lien sécurisé reçu par e-mail.`,
    },
    {
      label: 'Annulation tardive',
      description: `Passé le délai de ${delay}, l’annulation est prise en compte mais le créneau ne peut être libéré pour d’autres clientes. Contactez-nous directement pour étudier votre situation.`,
    },
    {
      label: 'Absence',
      description:
        'En cas d’absence sans préavis, Patricia se réserve le droit de demander un acompte pour toute réservation ultérieure.',
    },
    {
      label: 'Annulation par Patricia',
      description:
        'Si Patricia doit annuler pour un motif personnel (maladie, urgence), vous serez contactée sans délai et un nouveau rendez-vous vous sera proposé en priorité, sans frais.',
    },
  ];
}

const DEFAULT_ADDRESS = 'Ouest - Foire\nDakar, Sénégal';
const DEFAULT_CONTACT_EMAIL = 'zepatricia7@gmail.com';

async function loadSettings(): Promise<SalonSettingsData> {
  try {
    return await getCachedSalonSettings();
  } catch (error) {
    console.error('[infos-pratiques] paramètres illisibles, valeurs par défaut', error);
    return DEFAULT_SALON_SETTINGS;
  }
}

export default async function InfosPratiquesPage() {
  const settings = await loadSettings();
  const addressLines = (settings.address?.trim() || DEFAULT_ADDRESS)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const hoursLines = formatOpeningHours(settings.openingHours);
  const customCancellation = settings.cancellationPolicy?.trim() ?? '';
  const cancellationRules = customCancellation
    ? null
    : buildCancellationRules(settings.minCancelNoticeHours);
  const bookingParagraphs = splitParagraphs(resolveBookingPolicy(settings.bookingPolicy));
  return (
    <main className="page-main space-y-12">
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
        <p className="hidden text-sm font-semibold uppercase tracking-[0.14em] text-cacao md:block">
          Pratique
        </p>
        <Title as="h1" size="display" className="">
          Informations pratiques
        </Title>
        <p className="hidden text-lg leading-relaxed text-muted md:block">
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
            {addressLines.map((line, index) => (
              <span key={line}>
                {index > 0 ? <br /> : null}
                {line}
              </span>
            ))}
          </p>
          {settings.phone ? (
            <p className="text-muted">
              <span className="font-semibold text-fg">Téléphone</span>
              <br />
              {settings.phone}
            </p>
          ) : null}
          <p className="text-muted">
            <span className="font-semibold text-fg">E-mail</span>
            <br />
            {settings.contactEmail || DEFAULT_CONTACT_EMAIL}
          </p>
        </div>
        <div className="space-y-6 rounded-2xl bg-card p-8 shadow-soft">
          <Title as="h2" className="">
            Horaires
          </Title>
          {hoursLines.map((line) => (
            <p key={line} className="text-muted">
              {line}
            </p>
          ))}
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
              <Check aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Conditions de réservation (paramètre « bookingPolicy » ou texte par défaut) */}
      <section className="space-y-6">
        <Title as="h2" className="">
          Conditions de réservation
        </Title>
        <div className="max-w-3xl space-y-3 border-l-4 border-accent pl-5">
          {bookingParagraphs.map((paragraph) => (
            <p key={paragraph} className="leading-relaxed text-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* Politique d'annulation (paramètre « cancellationPolicy » ou règles par défaut) */}
      <section className="space-y-6">
        <Title as="h2" className="">
          Politique d&apos;annulation
        </Title>
        {cancellationRules ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {cancellationRules.map((rule) => (
              <div key={rule.label} className="border-l-4 border-accent pl-5">
                <h3 className="font-heading text-xl font-bold text-fg">{rule.label}</h3>
                <p className="mt-1 leading-relaxed text-muted">{rule.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-3xl space-y-3 border-l-4 border-accent pl-5">
            {splitParagraphs(customCancellation).map((paragraph) => (
              <p key={paragraph} className="leading-relaxed text-muted">
                {paragraph}
              </p>
            ))}
          </div>
        )}
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
            href="/coiffures"
            className="inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] border border-line bg-card px-6 py-3 font-semibold text-fg shadow-soft transition hover:border-cacao hover:bg-page"
          >
            Réserver un créneau
          </Link>
        </div>
      </section>
    </main>
  );
}

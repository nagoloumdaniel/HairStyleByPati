import Link from 'next/link';
import type { Metadata } from 'next';
import { Accordion } from '@/components/ui/Accordion';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    "Questions fréquentes sur les prestations, la réservation, l'annulation et les cheveux au salon Hairstyle by Patricia.",
  alternates: { canonical: '/faq' },
};

const faqItems = [
  {
    id: 'reservation',
    title: 'Comment réserver un rendez-vous ?',
    content:
      'Parcourez le catalogue, sélectionnez la prestation qui vous convient, répondez aux questions de compatibilité capillaire, puis choisissez votre date et votre heure. Vous recevez un e-mail de confirmation avec un lien de suivi sécurisé.',
  },
  {
    id: 'delai',
    title: 'Combien de temps à l’avance faut-il réserver ?',
    content:
      'Nous recommandons de réserver au moins une semaine à l’avance, surtout pour les tresses et les coiffures longues. Des créneaux de dernière minute restent parfois disponibles : contactez-nous pour vérifier.',
  },
  {
    id: 'cheveux',
    title: 'Quels types de cheveux accueillez-vous ?',
    content:
      'Le salon est spécialisé dans les cheveux texturés : tresses, vanilles, locs, départ de locs, coiffures protectrices et coupes. Chaque prestation est adaptée à votre nature de cheveux après un diagnostic capillaire.',
  },
  {
    id: 'preparation',
    title: 'Comment préparer mes cheveux avant le rendez-vous ?',
    content:
      'Venez avec des cheveux propres, démêlés et séchés. Si vous avez une coiffure existante (locs, tresses), ne la défaites pas la veille : nous nous en occupons au début du rendez-vous.',
  },
  {
    id: 'duree',
    title: 'Combien de temps dure une prestation ?',
    content:
      'La durée dépend de la coiffure et de votre longueur de cheveux. Chaque fiche du catalogue indique une durée indicative ; la durée réelle est confirmée lors du diagnostic au salon.',
  },
  {
    id: 'prix',
    title: 'Comment sont fixés les prix ?',
    content:
      'Les prix dépendent de la longueur, de la densité et de la complexité de la coiffure. Le catalogue affiche un prix de départ ou une fourchette. Le tarif final est toujours confirmé avant de commencer la prestation.',
  },
  {
    id: 'annulation',
    title: 'Quelle est la politique d’annulation ?',
    content:
      'Vous pouvez annuler ou déplacer votre rendez-vous gratuitement jusqu’à 24 heures avant l’heure convenue, via le lien sécurisé reçu par e-mail. Passé ce délai ou en cas d’absence, le salon applique les conditions détaillées dans les informations pratiques.',
  },
  {
    id: 'options',
    title: 'Puis-je ajouter des options à ma prestation ?',
    content:
      'Oui, la plupart des prestations proposent des options (soins, longueurs supplémentaires, motifs personnalisés). Elles sont sélectionnables lors de la réservation et influencent le prix et la durée.',
  },
];

export default function FaqPage() {
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
              FAQ
            </span>
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cacao">
          Questions fréquentes
        </p>
        <h1 className="font-heading text-4xl font-bold text-ink md:text-5xl">
          Vos questions, nos réponses
        </h1>
        <p className="text-lg leading-relaxed text-ink-soft">
          Réservation, préparation, prix, annulation : retrouvez les réponses aux questions les plus
          courantes. Une question reste sans réponse ? Contactez-nous, nous vous répondrons
          rapidement.
        </p>
      </header>

      <section aria-labelledby="faq-titre" className="max-w-3xl">
        <h2 id="faq-titre" className="sr-only">
          Liste des questions fréquentes
        </h2>
        <Accordion items={faqItems} />
      </section>

      <section className="max-w-3xl rounded-2xl bg-cream p-8 text-center md:p-10">
        <h2 className="font-heading text-2xl font-bold text-ink">Une autre question ?</h2>
        <p className="mx-auto mt-3 max-w-md text-ink-soft">
          Écrivez-nous, Patricia vous répond personnellement, généralement sous 24 heures ouvrées.
        </p>
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

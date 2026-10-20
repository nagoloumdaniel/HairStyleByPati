import Link from 'next/link';
import type { Metadata } from 'next';
import { Accordion } from '@/components/ui/Accordion';
import { Title } from '@/components/ui/Title';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    "Questions fréquentes sur les prestations, la réservation, l'annulation et les cheveux avec Hairstyle by Patricia.",
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
      'Patricia est spécialisée dans les cheveux texturés : tresses, vanilles, locs, départ de locs, coiffures protectrices et coupes. Chaque prestation est adaptée à votre nature de cheveux après un diagnostic capillaire.',
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
      'La durée dépend de la coiffure et de votre longueur de cheveux. Chaque fiche du catalogue indique une durée indicative ; la durée réelle est confirmée lors du diagnostic à votre domicile.',
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
      'Vous pouvez annuler ou déplacer votre rendez-vous gratuitement jusqu’à 24 heures avant l’heure convenue, via le lien sécurisé reçu par e-mail. Passé ce délai ou en cas d’absence, Patricia applique les conditions détaillées dans les informations pratiques.',
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
              FAQ
            </span>
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl space-y-3">
        <p className="hidden text-sm font-semibold uppercase tracking-[0.14em] text-cacao md:block">
          Questions fréquentes
        </p>
        <Title as="h1" size="display" className="">
          Vos questions, nos réponses
        </Title>
        <p className="hidden text-lg leading-relaxed text-muted md:block">
          Réservation, préparation, prix, annulation : retrouvez les réponses aux questions les plus
          courantes. Une question reste sans réponse ? Contactez-nous, nous vous répondrons
          rapidement.
        </p>
      </header>

      <section aria-labelledby="faq-titre">
        <h2 id="faq-titre" className="sr-only">
          Liste des questions fréquentes
        </h2>
        <Accordion items={faqItems} />
      </section>

      <section className="mx-auto w-full max-w-3xl rounded-2xl bg-page p-8 text-center md:p-10">
        <Title as="h2" className="">
          Une autre question ?
        </Title>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Écrivez-nous, Patricia vous répond personnellement, généralement sous 24 heures ouvrées.
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
            Voir le catalogue
          </Link>
        </div>
      </section>
    </main>
  );
}

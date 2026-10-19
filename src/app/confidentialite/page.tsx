import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Politique de confidentialité RGPD',
  description:
    'Politique de confidentialité du salon Hairstyle by Patricia : données collectées, finalités, conservation, droits et cookies.',
  alternates: { canonical: '/confidentialite' },
};

export default function ConfidentialitePage() {
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
              Politique de confidentialité
            </span>
          </li>
        </ol>
      </nav>

      <header className="max-w-3xl space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-cacao">
          Protection des données
        </p>
        <h1 className="font-heading text-4xl font-bold text-fg md:text-5xl">
          Politique de confidentialité
        </h1>
        <p className="text-lg leading-relaxed text-muted">
          Ce que nous collectons, pourquoi, combien de temps nous conservons vos données et comment
          exercer vos droits (RGPD).
        </p>
      </header>

      <section className="max-w-3xl space-y-8">
        <h2 className="font-heading text-3xl font-bold text-fg">1. Responsable du traitement</h2>
        <p className="text-muted leading-relaxed">
          Le salon Hairstyle by Patricia (Patricia, gérante) est responsable du traitement des
          données personnelles collectées sur ce site. Contact :{' '}
          <a href="mailto:contact@example.com" className="text-cacao underline">
            contact@example.com
          </a>
          .
        </p>
      </section>

      <section className="max-w-3xl space-y-8">
        <h2 className="font-heading text-3xl font-bold text-fg">2. Données collectées</h2>
        <ul className="list-disc list-inside space-y-2 text-muted leading-relaxed">
          <li>Formulaire de contact : nom, e-mail, téléphone (facultatif), sujet, message.</li>
          <li>
            Compte client et réservations : coordonnées, historique des rendez-vous et prestations.
          </li>
          <li>
            Évaluation capillaire (photos) : uniquement avec votre consentement, stockées en privé,
            jamais publiées dans la galerie publique.
          </li>
          <li>
            Données techniques : adresse IP (rate limiter du formulaire de contact, pas de
            profilage), cookies de session si authentification dashboard.
          </li>
        </ul>
        <p className="text-sm text-muted opacity-80 mt-4">
          Les données capillaires et photos ne sont collectées que dans la mesure nécessaire à la
          prestation. Aucune donnée sensible inutile n’est enregistrée.
        </p>
      </section>

      <section className="max-w-3xl space-y-8">
        <h2 className="font-heading text-3xl font-bold text-fg">3. Finalités et base légale</h2>
        <table className="w-full text-left border-collapse text-muted">
          <thead>
            <tr className="border-b border-line">
              <th className="pb-2 font-medium text-fg">Finalité</th>
              <th className="pb-2 font-medium text-fg">Base légale</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <tr>
              <td className="py-3">Répondre à vos messages (contact)</td>
              <td className="py-3">Votre consentement</td>
            </tr>
            <tr>
              <td className="py-3">Gérer vos rendez-vous et prestations</td>
              <td className="py-3">Exécution du contrat</td>
            </tr>
            <tr>
              <td className="py-3">Protéger le formulaire contre les spams</td>
              <td className="py-3">Intérêt légitime du salon</td>
            </tr>
            <tr>
              <td className="py-3">Évaluer la compatibilité capillaire</td>
              <td className="py-3">Votre consentement</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="max-w-3xl space-y-8">
        <h2 className="font-heading text-3xl font-bold text-fg">4. Durée de conservation</h2>
        <ul className="list-disc list-inside space-y-2 text-muted leading-relaxed">
          <li>Messages de contact : 12 mois maximum après la dernière réponse.</li>
          <li>
            Données de réservation et client : durée de la relation client + délais légaux
            (facturation).
          </li>
          <li>Photos d’évaluation : durée configurée par le salon, puis purge automatique.</li>
          <li>
            Adresse IP (rate limiter) : conservé le temps de la fenêtre de rate limiting, puis
            supprimé.
          </li>
        </ul>
        <p className="text-sm text-muted opacity-80 mt-4">
          Vous pouvez demander la suppression ou la rectification de vos données à tout moment (voir
          §6).
        </p>
      </section>

      <section className="max-w-3xl space-y-8">
        <h2 className="font-heading text-3xl font-bold text-fg">
          5. Destinataires et sous-traitants
        </h2>
        <p className="text-muted leading-relaxed">
          Vos données ne sont ni vendues ni louées. Elles peuvent être transmises à des prestataires
          techniques strictement nécessaires au fonctionnement du site : hébergement, base de
          données, envoi d’e-mails (confirmation de réservation), et analytics si activés. Chaque
          prestataire est contractuellement engagé à respecter la confidentialité et la sécurité des
          données (DPA).
        </p>
      </section>

      <section className="max-w-3xl space-y-8">
        <h2 className="font-heading text-3xl font-bold text-fg">6. Vos droits (RGPD)</h2>
        <p className="text-muted leading-relaxed">
          Conformément au RGPD, vous pouvez exercer gratuitement les droits suivants :
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted leading-relaxed">
          <li>Accéder aux données vous concernant.</li>
          <li>Demander la rectification de données inexactes ou incomplètes.</li>
          <li>
            Demander la suppression de vos données (droit à l’oubli), sous réserve des obligations
            légales de conservation.
          </li>
          <li>
            Vous opposer au traitement de vos données pour des raisons tenant à votre situation
            particulière.
          </li>
          <li>Demander la portabilité de vos données.</li>
          <li>
            Retirer votre consentement à tout moment, sans effet sur la légalité du traitement
            passé.
          </li>
        </ul>
        <p className="text-muted leading-relaxed mt-4">
          Pour exercer ces droits ou poser une question, écrivez à{' '}
          <a href="mailto:contact@example.com" className="text-cacao underline">
            contact@example.com
          </a>
          . Une pièce d’identité peut vous être demandée pour prévenir tout abus. En cas de
          désaccord persistant, vous pouvez introduire une réclamation auprès de la CNIL.
        </p>
      </section>

      <section className="max-w-3xl space-y-8">
        <h2 className="font-heading text-3xl font-bold text-fg">7. Cookies et traceurs</h2>
        <p className="text-muted leading-relaxed">
          Ce site peut utiliser des cookies strictement nécessaires à son fonctionnement (session du
          tableau de bord, protection du formulaire de contact). Aucun cookie de traçage
          publicitaire n’est déposé sans votre consentement préalable. Vous pouvez configurer ou
          désactiver les cookies depuis votre navigateur.
        </p>
      </section>

      <section className="max-w-3xl space-y-8">
        <h2 className="font-heading text-3xl font-bold text-fg">8. Sécurité</h2>
        <p className="text-muted leading-relaxed">
          Le salon met en œuvre des mesures de sécurité adaptées pour protéger vos données contre
          toute destruction, perte, altération ou accès non autorisé : authentification protégée
          côté serveur pour le dashboard, mots de passe hashés, requêtes minimales et validation des
          entrées côté serveur.
        </p>
      </section>

      <section className="max-w-3xl rounded-2xl bg-page p-8 text-center md:p-10 border border-line">
        <h2 className="font-heading text-2xl font-bold text-fg">Exercer vos droits</h2>
        <p className="mx-auto mt-3 max-w-md text-muted">
          Contactez Patricia pour toute question sur vos données personnelles.
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

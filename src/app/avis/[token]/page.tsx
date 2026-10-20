import type { Metadata } from 'next';
import { getReviewByToken } from '@/modules/avis/queries';
import { isReviewTokenValid } from '@/modules/avis/engine';
import { ReviewForm } from './review-form';

export const metadata: Metadata = {
  title: 'Laisser un avis',
  robots: { index: false, follow: false },
};

export default async function AvisTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const review = await getReviewByToken(token);

  if (!review) {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-[var(--radius-lg)] border border-alert bg-alert-soft p-8 text-center">
          <h1 className="font-heading text-2xl font-bold text-alert">Lien invalide</h1>
          <p className="mt-3 text-fg">Ce lien d’avis ne correspond à aucun rendez-vous.</p>
        </div>
      </main>
    );
  }

  const tokenValid = isReviewTokenValid(review.tokenExpiresAt, new Date());
  if (!tokenValid || review.status !== 'PENDING') {
    return (
      <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-[var(--radius-lg)] border border-line bg-card p-8 text-center">
          <h1 className="font-heading text-2xl font-bold text-fg">
            {review.status === 'PENDING' ? 'Lien expiré' : 'Avis déjà envoyé'}
          </h1>
          <p className="mt-3 text-muted">
            {review.status === 'PENDING'
              ? 'Ce lien d’avis a expiré. Contactez le salon si vous souhaitez tout de même laisser un avis.'
              : 'Merci, votre avis a déjà été transmis.'}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-12 sm:px-6">
      <div className="rounded-[var(--radius-lg)] border border-line bg-card p-8 shadow-soft">
        <h1 className="font-heading text-2xl font-bold text-fg">
          Votre avis sur « {review.service.name} »
        </h1>
        <p className="mt-2 text-muted">Votre avis est relu par Patricia avant toute publication.</p>
        <div className="mt-6">
          <ReviewForm token={token} />
        </div>
      </div>
    </main>
  );
}

'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/Button';
import { adminModerateReview, type ReviewActionState } from '@/modules/avis/actions';

type ReviewRow = {
  id: string;
  rating: number | null;
  comment: string | null;
  customer: { name: string; email: string };
  service: { name: string };
  submittedAt: Date | null;
};

function ModerationForm({ review }: { review: ReviewRow }) {
  const [state, formAction, pending] = useActionState<ReviewActionState, FormData>(
    adminModerateReview,
    {},
  );
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input type="hidden" name="id" value={review.id} />
      <Button type="submit" name="decision" value="APPROVED" size="sm" loading={pending}>
        Approuver
      </Button>
      <Button
        type="submit"
        name="decision"
        value="REJECTED"
        variant="danger"
        size="sm"
        loading={pending}
      >
        Rejeter
      </Button>
      {state.error ? (
        <span role="alert" className="text-xs text-alert">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

export function AvisClient({ reviews }: { reviews: ReviewRow[] }) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-[var(--radius-md)] border border-dashed border-line p-8 text-center text-muted">
        Aucun avis en attente de modération.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-3">
      {reviews.map((review) => (
        <li key={review.id} className="rounded-[var(--radius-md)] border border-line bg-card p-4">
          <p className="font-semibold text-fg">
            {review.customer.name} · {review.service.name} · {review.rating ?? '—'} / 5
          </p>
          <p className="text-sm text-muted">{review.customer.email}</p>
          {review.comment ? <p className="mt-2 text-fg">{review.comment}</p> : null}
          <div className="mt-3">
            <ModerationForm review={review} />
          </div>
        </li>
      ))}
    </ul>
  );
}

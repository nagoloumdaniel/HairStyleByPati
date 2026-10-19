'use client';

import { useActionState, useState } from 'react';
import { decideAssessment, type AssessmentDecisionState } from '@/modules/compatibilite/actions';
import {
  ASSESSMENT_DECISIONS,
  ASSESSMENT_DECISION_LABELS,
  type AssessmentDecision,
} from '@/modules/compatibilite/schemas';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';

/* ============================================================
 * P5.6 : décision de Patricia sur une évaluation.
 * Rappel : la décision ne crée aucune réservation.
 * ============================================================ */

const DECISION_HINTS: Record<AssessmentDecision, string> = {
  ACCEPT: 'La cliente pourra réserver, sous réserve que le créneau choisi soit encore disponible.',
  REFUSE:
    'Expliquez pourquoi la prestation ne peut pas être réalisée et proposez une alternative si possible.',
  REQUEST_INFO:
    'Indiquez précisément quelles informations ou quelles photos complémentaires sont attendues.',
  PROPOSE_ALTERNATIVE:
    'Proposez une autre coiffure adaptée à la situation capillaire décrite par la cliente.',
  ALLOW_CONDITIONAL:
    'Précisez les conditions de réalisation : longueur minimale, options, temps supplémentaire, soin préalable…',
};

export function DecisionForm({
  assessmentId,
  terminal,
}: {
  assessmentId: string;
  terminal: boolean;
}) {
  const [state, formAction, pending] = useActionState<AssessmentDecisionState, FormData>(
    decideAssessment,
    {},
  );
  const [decision, setDecision] = useState<AssessmentDecision>('ACCEPT');

  if (terminal) {
    return (
      <p className="rounded-[var(--radius-md)] bg-cream-dark px-4 py-3 text-sm text-ink-soft">
        Une décision définitive a déjà été enregistrée pour cette évaluation. L’historique
        ci-dessous conserve la décision et son message.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="assessmentId" value={assessmentId} />
      <Select
        label="Décision"
        name="decision"
        value={decision}
        onChange={(event) => setDecision(event.target.value as AssessmentDecision)}
        options={ASSESSMENT_DECISIONS.map((value) => ({
          value,
          label: ASSESSMENT_DECISION_LABELS[value],
        }))}
      />
      <p className="text-sm text-ink-soft">{DECISION_HINTS[decision]}</p>

      <Textarea
        label="Message transmis à la cliente"
        name="decisionMessage"
        required
        rows={4}
        hint="Ce message explique la décision et reste conservé dans l’historique."
      />
      <Textarea
        label="Note interne (facultatif)"
        name="decisionNote"
        rows={2}
        hint="Visible uniquement dans le dashboard."
      />

      {state.error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] bg-alert-soft px-4 py-3 text-sm font-medium text-alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          role="status"
          className="rounded-[var(--radius-md)] bg-success-soft px-4 py-3 text-sm font-medium text-success"
        >
          {state.success}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending}>
          Enregistrer la décision
        </Button>
        <p className="text-sm text-ink-soft">Aucun rendez-vous n’est créé par cette action.</p>
      </div>
    </form>
  );
}

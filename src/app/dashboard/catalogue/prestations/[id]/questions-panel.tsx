'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { useActionState, useEffect, useRef, useState } from 'react';
import type { AdminQuestion } from '@/lib/catalogue-admin';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import {
  adminCreateQuestion,
  adminDeleteQuestion,
  adminReorderQuestions,
  adminUpdateQuestion,
  type CatalogueActionState,
} from '@/modules/catalogue/actions';

/* ============================================================
 * P4.8 — Éditeur des questions capillaires par prestation.
 * Les questions peuvent être conditionnelles (affichées selon
 * la réponse à une autre question).
 * ============================================================ */

const ANSWER_TYPES = [
  { value: 'SINGLE_CHOICE', label: 'Choix unique' },
  { value: 'MULTI_CHOICE', label: 'Choix multiple' },
  { value: 'BOOLEAN', label: 'Oui / Non' },
  { value: 'TEXT', label: 'Texte libre' },
  { value: 'PHOTO', label: 'Photo' },
] as const;

const TYPE_LABELS: Record<string, string> = Object.fromEntries(
  ANSWER_TYPES.map((type) => [type.value, type.label]),
);

function conditionOf(condition: unknown): { dependsOn: string; equals: string } {
  if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
    const record = condition as Record<string, unknown>;
    return {
      dependsOn: typeof record.dependsOn === 'string' ? record.dependsOn : '',
      equals: typeof record.equals === 'string' ? record.equals : '',
    };
  }
  return { dependsOn: '', equals: '' };
}

function QuestionForm({
  action,
  serviceId,
  initial,
  submitLabel,
  defaultOrder,
  onDone,
}: {
  action: (prev: CatalogueActionState, formData: FormData) => Promise<CatalogueActionState>;
  serviceId: string;
  initial?: AdminQuestion;
  submitLabel: string;
  defaultOrder: number;
  onDone?: () => void;
}) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(action, {});
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  const condition = conditionOf(initial?.condition);

  useEffect(() => {
    if (state.success) doneRef.current?.();
  }, [state.success]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="serviceId" value={serviceId} />
      {initial?.id ? <input type="hidden" name="id" value={initial.id} /> : null}

      <Input
        label="Clé technique"
        name="key"
        required
        defaultValue={initial?.key ?? ''}
        hint="Minuscules, chiffres et tirets bas. Exemple : longueur_actuelle."
      />
      <Input
        label="Question posée à la cliente"
        name="label"
        required
        defaultValue={initial?.label ?? ''}
        hint="Formulation claire et directe."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Type de réponse"
          name="type"
          defaultValue={initial?.type ?? 'SINGLE_CHOICE'}
          options={ANSWER_TYPES.map((type) => ({ value: type.value, label: type.label }))}
        />
        <Input
          label="Ordre d'affichage"
          name="order"
          type="number"
          min={0}
          defaultValue={String(initial?.order ?? defaultOrder)}
        />
      </div>

      <Input
        label="Choix proposés"
        name="options"
        defaultValue={initial?.options?.join(', ') ?? ''}
        hint="Pour les types Choix unique et Choix multiple : séparez les choix par des virgules. Laissez vide pour un champ libre."
      />
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            name="required"
            defaultChecked={initial?.required ?? true}
            className="size-4"
          />
          Réponse obligatoire
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            name="active"
            defaultChecked={initial?.active ?? true}
            className="size-4"
          />
          Question active
        </label>
      </div>

      <fieldset className="rounded-[var(--radius-md)] border border-line p-4">
        <legend className="px-2 text-sm font-semibold">Affichage conditionnel (facultatif)</legend>
        <p className="mb-3 text-sm text-muted">
          N’afficher cette question que si une autre question a une réponse donnée.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Clé de la question de départ"
            name="conditionDependsOn"
            defaultValue={condition.dependsOn}
            hint="Exemple : porte_des_locs"
          />
          <Input
            label="Valeur attendue"
            name="conditionEquals"
            defaultValue={condition.equals}
            hint="Exemple : oui"
          />
        </div>
      </fieldset>

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
      <Button type="submit" loading={pending}>
        {submitLabel}
      </Button>
    </form>
  );
}

function EditQuestionButton({
  serviceId,
  question,
}: {
  serviceId: string;
  question: AdminQuestion;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        Modifier
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={`Modifier « ${question.label} »`}>
        <QuestionForm
          action={adminUpdateQuestion}
          serviceId={serviceId}
          initial={question}
          submitLabel="Enregistrer"
          defaultOrder={question.order}
          onDone={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}

function DeleteQuestionForm({ question }: { question: AdminQuestion }) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(
    adminDeleteQuestion,
    {},
  );
  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(`Supprimer la question « ${question.label} » ?`)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={question.id} />
      <Button type="submit" variant="danger" size="sm" loading={pending}>
        Supprimer
      </Button>
      {state.error ? (
        <p role="alert" className="text-xs text-alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}

function ReorderQuestionButton({
  serviceId,
  questions,
  index,
  direction,
}: {
  serviceId: string;
  questions: AdminQuestion[];
  index: number;
  direction: -1 | 1;
}) {
  const [state, formAction, pending] = useActionState<CatalogueActionState, FormData>(
    adminReorderQuestions,
    {},
  );
  const target = index + direction;
  const current = questions[index];
  const swap = questions[target];
  if (!current || !swap) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex size-8 items-center justify-center rounded-[var(--radius-sm)] border border-line text-muted/40"
      >
        {direction === -1 ? (
          <ArrowUp aria-hidden="true" className="size-4" />
        ) : (
          <ArrowDown aria-hidden="true" className="size-4" />
        )}
      </span>
    );
  }
  const reordered = [...questions];
  reordered[index] = swap;
  reordered[target] = current;
  const items = reordered.map((question, order) => ({ id: question.id, order }));

  return (
    <form action={formAction}>
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <Button
        type="submit"
        variant="ghost"
        size="sm"
        loading={pending}
        aria-label={`${direction === -1 ? 'Monter' : 'Descendre'} la question`}
        title={direction === -1 ? 'Monter' : 'Descendre'}
      >
        {direction === -1 ? (
          <ArrowUp aria-hidden="true" className="size-4" />
        ) : (
          <ArrowDown aria-hidden="true" className="size-4" />
        )}
      </Button>
      {state.error ? (
        <span role="alert" className="text-xs text-alert">
          {state.error}
        </span>
      ) : null}
    </form>
  );
}

export function QuestionsPanel({
  serviceId,
  questions,
}: {
  serviceId: string;
  questions: AdminQuestion[];
}) {
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">
          Les réponses serviront à évaluer la compatibilité capillaire avant la réservation.
        </p>
        <Button type="button" size="sm" onClick={() => setCreateOpen(true)}>
          Ajouter une question
        </Button>
      </div>

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Nouvelle question">
        <QuestionForm
          action={adminCreateQuestion}
          serviceId={serviceId}
          submitLabel="Ajouter la question"
          defaultOrder={questions.length}
          onDone={() => setCreateOpen(false)}
        />
      </Modal>

      {questions.length === 0 ? (
        <p className="rounded-[var(--radius-md)] border border-dashed border-line p-8 text-center text-muted">
          Aucune question. La réservation utilisera le questionnaire par défaut.
        </p>
      ) : (
        <ol className="flex flex-col gap-2">
          {questions.map((question, index) => {
            const condition = conditionOf(question.condition);
            return (
              <li
                key={question.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-line bg-card p-3"
              >
                <div className="flex min-w-0 items-start gap-2">
                  <div className="flex flex-col gap-1">
                    <ReorderQuestionButton
                      serviceId={serviceId}
                      questions={questions}
                      index={index}
                      direction={-1}
                    />
                    <ReorderQuestionButton
                      serviceId={serviceId}
                      questions={questions}
                      index={index}
                      direction={1}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-2 font-semibold">
                      <span className="truncate">{question.label}</span>
                      {question.required ? (
                        <Badge tone="accent">Obligatoire</Badge>
                      ) : (
                        <Badge tone="neutral">Facultative</Badge>
                      )}
                      {question.active ? null : <Badge tone="alert">Inactive</Badge>}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      Clé : {question.key} · {TYPE_LABELS[question.type] ?? question.type} · ordre{' '}
                      {question.order}
                    </p>
                    {condition.dependsOn ? (
                      <p className="mt-1 text-sm text-muted">
                        Affichée si « {condition.dependsOn} » = « {condition.equals} »
                      </p>
                    ) : null}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <EditQuestionButton serviceId={serviceId} question={question} />
                  <DeleteQuestionForm question={question} />
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

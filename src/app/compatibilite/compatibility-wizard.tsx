'use client';

import { Check } from 'lucide-react';

import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import type { CompatibilityRuleData } from '@/modules/compatibilite/engine';
import {
  isQuestionAnswered,
  isQuestionVisible,
  type PublicQuestion,
} from '@/modules/compatibilite/questions';
import {
  previewCompatibility,
  submitAssessment,
  type CompatibilityPreviewState,
  type CompatibilitySubmitState,
} from '@/modules/compatibilite/actions';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Title } from '@/components/ui/Title';

/* ============================================================
 * P5.3 / P5.4 : parcours public conditionnel de compatibilité.
 * Le verdict affiché vient toujours du serveur ; le client ne fait
 * qu'afficher et collecter les réponses.
 * ============================================================ */

type Phase = 'questions' | 'result' | 'contact' | 'done';

function verdictTone(verdict: string): 'success' | 'alert' | 'accent' {
  if (verdict === 'COMPATIBLE') return 'success';
  if (verdict === 'INCOMPATIBLE') return 'alert';
  return 'accent';
}

function verdictLabel(verdict: string): string {
  if (verdict === 'COMPATIBLE') return 'Compatible';
  if (verdict === 'INCOMPATIBLE') return 'Incompatible';
  return 'À vérifier';
}

export function QuestionField({
  question,
  value,
  onChange,
}: {
  question: PublicQuestion;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const inputId = `question-${question.key}`;
  const describedBy = question.help ? `${inputId}-help` : undefined;

  const help = question.help ? (
    <p id={`${inputId}-help`} className="text-sm text-muted">
      {question.help}
    </p>
  ) : null;

  if (question.type === 'PHOTO') {
    return (
      <fieldset className="rounded-[var(--radius-md)] border border-line p-4">
        <legend className="px-2 text-sm font-semibold text-fg">{question.label}</legend>
        <p className="text-sm text-muted">
          Vous pourrez joindre une photo de vos cheveux juste après la vérification.
        </p>
      </fieldset>
    );
  }

  if (question.type === 'TEXT') {
    return (
      <Textarea
        label={question.label}
        name={inputId}
        id={inputId}
        required={question.required}
        value={typeof value === 'string' ? value : ''}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={describedBy}
        rows={3}
      />
    );
  }

  if (question.type === 'MULTI_CHOICE' && question.options.length > 0) {
    const selected = Array.isArray(value) ? value.map(String) : [];
    return (
      <fieldset className="rounded-[var(--radius-md)] border border-line p-4">
        <legend className="px-2 text-sm font-semibold text-fg">
          {question.label}
          {question.required ? <span className="text-alert"> *</span> : null}
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {question.options.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name={`${inputId}-${option.value}`}
                checked={selected.includes(option.value)}
                onChange={(event) => {
                  const next = event.target.checked
                    ? [...selected, option.value]
                    : selected.filter((item) => item !== option.value);
                  onChange(next);
                }}
                className="size-4"
              />
              {option.label}
            </label>
          ))}
        </div>
        {help}
      </fieldset>
    );
  }

  if (question.options.length > 0) {
    return (
      <fieldset className="rounded-[var(--radius-md)] border border-line p-4">
        <legend className="px-2 text-sm font-semibold text-fg">
          {question.label}
          {question.required ? <span className="text-alert"> *</span> : null}
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {question.options.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] border px-3 py-2 text-sm transition ${
                value === option.value
                  ? 'border-cacao bg-accent-soft font-semibold text-fg'
                  : 'border-line hover:border-cacao'
              }`}
            >
              <input
                type="radio"
                name={inputId}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                required={question.required}
                aria-describedby={describedBy}
                className="size-4"
              />
              {option.label}
            </label>
          ))}
        </div>
        {help}
      </fieldset>
    );
  }

  return (
    <Input
      label={question.label}
      name={inputId}
      id={inputId}
      required={question.required}
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
      aria-describedby={describedBy}
    />
  );
}

export function CompatibilityWizard({
  serviceSlug,
  serviceName,
  rule,
  questions,
}: {
  serviceSlug: string;
  serviceName: string;
  rule: CompatibilityRuleData | null;
  questions: PublicQuestion[];
}) {
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [phase, setPhase] = useState<Phase>('questions');
  const [clientError, setClientError] = useState('');
  const [previewState, previewAction, previewPending] = useActionState<
    CompatibilityPreviewState,
    FormData
  >(previewCompatibility, {});
  const [submitState, submitAction, submitPending] = useActionState<
    CompatibilitySubmitState,
    FormData
  >(submitAssessment, {});
  const headingRef = useRef<HTMLHeadingElement>(null);

  const visibleQuestions = questions.filter((question) =>
    isQuestionVisible(question.condition, answers),
  );

  useEffect(() => {
    if (previewState.preview && phase === 'questions') setPhase('result');
  }, [previewState.preview, phase]);

  useEffect(() => {
    if (submitState.success) setPhase('done');
  }, [submitState.success]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [phase]);

  const preview = previewState.preview;
  const success = submitState.success;
  const photoForbidden = rule?.photoPolicy === 'FORBIDDEN';
  const photoRequired = preview?.photoRequired ?? rule?.photoPolicy === 'REQUIRED';

  const setAnswer = (key: string, value: unknown) => {
    setAnswers((previous) => ({ ...previous, [key]: value }));
    setClientError('');
  };

  const handleQuestionsSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const missing = visibleQuestions.filter(
      (question) =>
        question.required && question.type !== 'PHOTO' && !isQuestionAnswered(question, answers),
    );
    if (missing.length > 0) {
      event.preventDefault();
      setClientError(
        `Complétez les questions suivantes : ${missing.map((question) => question.label).join(', ')}.`,
      );
    }
  };

  const step = phase === 'questions' ? 1 : phase === 'done' ? 3 : phase === 'contact' ? 3 : 2;

  return (
    <div className="space-y-5">
      <ol className="flex flex-wrap items-center gap-2 text-sm" aria-label="Étapes">
        {[
          { number: 1, label: 'Vos cheveux' },
          { number: 2, label: 'Résultat' },
          { number: 3, label: 'Demande' },
        ].map((item) => (
          <li
            key={item.number}
            aria-current={step === item.number ? 'step' : undefined}
            className={`inline-flex items-center gap-2 rounded-[var(--radius-full)] px-3 py-1.5 ${
              step === item.number
                ? 'bg-ink font-semibold text-panel-fg'
                : step > item.number
                  ? 'bg-success-soft text-success'
                  : 'bg-line text-muted'
            }`}
          >
            <span aria-hidden="true" className="font-bold">
              {step > item.number ? <Check aria-hidden="true" className="size-4" /> : item.number}
            </span>
            {item.label}
          </li>
        ))}
      </ol>

      {phase === 'questions' ? (
        <Card>
          <Title
            as="h2"
            ref={headingRef}
            tabIndex={-1}

            className="outline-none"
          >
            Quelques questions sur vos cheveux
          </Title>
          <p className="mt-2 text-muted">
            Pour {serviceName}, seules les informations réellement utiles sont demandées.
          </p>

          <form
            action={previewAction}
            onSubmit={handleQuestionsSubmit}
            className="mt-6 flex flex-col gap-5"
          >
            <input type="hidden" name="serviceSlug" value={serviceSlug} />
            <input type="hidden" name="answers" value={JSON.stringify(answers)} />

            {visibleQuestions.length === 0 ? (
              <p className="rounded-[var(--radius-md)] bg-success-soft px-4 py-3 text-sm text-success">
                Cette prestation n’a pas de restriction capillaire particulière. Vous pouvez passer
                directement à la réservation.
              </p>
            ) : (
              visibleQuestions.map((question) => (
                <QuestionField
                  key={question.key}
                  question={question}
                  value={answers[question.key]}
                  onChange={(value) => setAnswer(question.key, value)}
                />
              ))
            )}

            {clientError ? (
              <p
                role="alert"
                className="rounded-[var(--radius-md)] bg-alert-soft px-4 py-3 text-sm font-medium text-alert"
              >
                {clientError}
              </p>
            ) : null}
            {previewState.error ? (
              <p
                role="alert"
                className="rounded-[var(--radius-md)] bg-alert-soft px-4 py-3 text-sm font-medium text-alert"
              >
                {previewState.error}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" loading={previewPending}>
                Vérifier ma compatibilité
              </Button>
              <Link
                href={`/coiffures/${serviceSlug}`}
                className="text-sm font-semibold text-cacao underline-offset-4 hover:underline"
              >
                Retour à la prestation
              </Link>
            </div>
          </form>
        </Card>
      ) : null}

      {phase === 'result' && preview ? (
        <Card>
          <div className="flex flex-wrap items-center gap-3">
            <Badge tone={verdictTone(preview.verdict)}>{verdictLabel(preview.verdict)}</Badge>
            <Title
              as="h2"
              ref={headingRef}
              tabIndex={-1}

              className="outline-none"
            >
              {preview.verdict === 'COMPATIBLE'
                ? 'Bonne nouvelle'
                : preview.verdict === 'INCOMPATIBLE'
                  ? 'Cette prestation semble inadaptée'
                  : 'Une vérification est nécessaire'}
            </Title>
          </div>

          <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-fg">
            {preview.message}
          </p>
          {preview.conditionsNote ? (
            <p className="mt-3 rounded-[var(--radius-md)] bg-accent-soft px-4 py-3 text-sm text-fg">
              {preview.conditionsNote}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {preview.nextStep === 'BOOK' ? (
              <Link
                href={`/reserver?service=${encodeURIComponent(serviceSlug)}`}
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-accent px-6 py-3 font-semibold text-accent-fg shadow-soft transition hover:bg-accent-hover active:scale-[0.98]"
              >
                Réserver cette prestation
              </Link>
            ) : null}

            {preview.nextStep === 'SUBMIT_ASSESSMENT' ? (
              <Button type="button" onClick={() => setPhase('contact')}>
                {preview.canRequestPhotoEvaluation
                  ? 'Envoyer une photo pour évaluation'
                  : 'Demander une évaluation à Patricia'}
              </Button>
            ) : null}

            {preview.nextStep === 'BLOCKED' ? (
              <>
                <Link
                  href="/coiffures"
                  className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-accent px-6 py-3 font-semibold text-accent-fg shadow-soft transition hover:bg-accent-hover"
                >
                  Voir les autres coiffures
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-line bg-card px-6 py-3 font-semibold text-fg transition hover:border-cacao"
                >
                  Contacter Patricia
                </Link>
              </>
            ) : null}

            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setPhase('questions');
                setClientError('');
              }}
            >
              Modifier mes réponses
            </Button>
          </div>

          {preview.verdict === 'INCOMPATIBLE' && preview.suggestions.length > 0 ? (
            <div className="mt-6 rounded-[var(--radius-md)] border border-line bg-page p-5">
              <h3 className="font-heading text-lg font-bold text-fg">
                Ces coiffures sont compatibles avec vos réponses
              </h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {preview.suggestions.map((suggestion) => (
                  <li key={suggestion.id}>
                    <Link
                      href={`/coiffures/${suggestion.slug}`}
                      className="inline-flex items-center rounded-[var(--radius-md)] border border-line bg-card px-4 py-2 font-semibold text-fg transition hover:border-cacao"
                    >
                      {suggestion.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {preview.nextStep !== 'BOOK' ? (
            <p className="mt-4 text-sm text-muted">
              Aucune réservation n’est créée à cette étape. Patricia examine votre demande et vous
              répond. La disponibilité du créneau sera vérifiée séparément au moment de réserver.
            </p>
          ) : (
            <p className="mt-4 text-sm text-muted">
              La compatibilité et la disponibilité seront vérifiées à nouveau côté serveur au moment
              d’enregistrer votre rendez-vous.
            </p>
          )}
        </Card>
      ) : null}

      {phase === 'contact' ? (
        <Card>
          <Title
            as="h2"
            ref={headingRef}
            tabIndex={-1}

            className="outline-none"
          >
            Demander l’évaluation de Patricia
          </Title>
          <p className="mt-2 text-muted">
            Laissez vos coordonnées pour recevoir la réponse. Vos informations capillaires et vos
            photos ne sont jamais publiées.
          </p>

          <form action={submitAction} className="mt-6 flex flex-col gap-5">
            <input type="hidden" name="serviceSlug" value={serviceSlug} />
            <input type="hidden" name="answers" value={JSON.stringify(answers)} />
            <div className="absolute -left-[9999px]" aria-hidden="true">
              <label htmlFor="compat-website">Site web</label>
              <input
                id="compat-website"
                name="website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Nom et prénom" name="name" required autoComplete="name" />
              <Input label="E-mail" name="email" type="email" required autoComplete="email" />
              <Input
                label="Téléphone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                hint="Pour vous joindre si nécessaire."
              />
            </div>

            <Textarea
              label="Informations complémentaires (facultatif)"
              name="comment"
              rows={4}
              hint="Précisez ce qui vous fait douter, ou toute information utile à Patricia."
            />

            {!photoForbidden ? (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="compat-photos" className="text-sm font-semibold text-fg">
                  Photos de vos cheveux {photoRequired ? '(obligatoire)' : '(facultatif)'}
                </label>
                <input
                  id="compat-photos"
                  name="photos"
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  required={photoRequired}
                  className="w-full rounded-[var(--radius-md)] border border-line bg-card px-4 py-2.5 text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent-soft file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-fg"
                />
                <p className="text-sm text-muted">
                  JPEG, PNG ou WebP, 5 Mo maximum par photo, 3 photos maximum. Ces photos restent
                  privées et ne sont visibles que par Patricia.
                </p>
              </div>
            ) : (
              <p className="rounded-[var(--radius-md)] bg-line px-4 py-3 text-sm text-muted">
                Cette prestation ne nécessite pas de photo. Votre commentaire suffit à Patricia pour
                vous répondre.
              </p>
            )}

            <label className="flex items-start gap-3 text-sm">
              <input type="checkbox" name="consent" required className="mt-0.5 size-4" />
              <span>
                J’accepte que mes informations capillaires et mes photos soient utilisées uniquement
                pour évaluer cette prestation. Voir la{' '}
                <Link
                  href="/confidentialite"
                  className="font-semibold text-cacao underline underline-offset-4"
                >
                  politique de confidentialité
                </Link>
                .
              </span>
            </label>

            {submitState.error ? (
              <p
                role="alert"
                className="rounded-[var(--radius-md)] bg-alert-soft px-4 py-3 text-sm font-medium text-alert"
              >
                {submitState.error}
              </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" loading={submitPending}>
                Envoyer ma demande
              </Button>
              <Button type="button" variant="ghost" onClick={() => setPhase('result')}>
                Retour
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {phase === 'done' && success ? (
        <Card>
          <Title
            as="h2"
            ref={headingRef}
            tabIndex={-1}

            className="outline-none"
          >
            {success.status === 'COMPATIBLE'
              ? 'Vos informations sont compatibles'
              : 'Votre demande a bien été transmise'}
          </Title>
          <p className="mt-3 whitespace-pre-line text-lg text-fg">{success.message}</p>

          {success.status === 'RECEIVED' ? (
            <div className="mt-4 space-y-2 rounded-[var(--radius-md)] bg-accent-soft px-4 py-3 text-sm text-fg">
              <p>
                Statut : <strong>en attente d’évaluation</strong>. Patricia vous répondra après
                examen de vos informations.
              </p>
              {success.reference ? (
                <p>
                  Référence de votre demande : <strong>{success.reference}</strong>
                </p>
              ) : null}
              <p>Une évaluation n’est pas une réservation : aucun créneau n’est réservé.</p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            {success.canBook ? (
              <Link
                href={`/reserver?service=${encodeURIComponent(serviceSlug)}`}
                className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-accent px-6 py-3 font-semibold text-accent-fg shadow-soft transition hover:bg-accent-hover active:scale-[0.98]"
              >
                Réserver cette prestation
              </Link>
            ) : null}
            <Link
              href="/coiffures"
              className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-line bg-card px-6 py-3 font-semibold text-fg transition hover:border-cacao"
            >
              Retour au catalogue
            </Link>
          </div>
        </Card>
      ) : null}
    </div>
  );
}

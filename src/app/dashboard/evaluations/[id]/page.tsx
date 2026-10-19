import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import { assessmentEngineAnswers, getAssessmentDetail } from '@/modules/compatibilite/queries';
import { evaluateCompatibility } from '@/modules/compatibilite/engine';
import {
  ASSESSMENT_STATUS_LABELS,
  ASSESSMENT_DECISION_LABELS,
} from '@/modules/compatibilite/schemas';
import { listAuditLogsForEntity } from '@/modules/stats/audit';
import { signedPrivatePhotos } from '@/modules/fichiers/private-images';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { DecisionForm } from './decision-form';

export const metadata: Metadata = { title: 'Évaluation capillaire - Tableau de bord' };

const STATUS_TONES: Record<string, 'accent' | 'success' | 'alert' | 'neutral'> = {
  RECEIVED: 'accent',
  IN_PROGRESS: 'accent',
  INFO_REQUESTED: 'neutral',
  ACCEPTED: 'success',
  REFUSED: 'alert',
  BOOKING_PENDING: 'neutral',
  CONFIRMED: 'success',
};

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'short',
  timeStyle: 'short',
});

const ACTION_LABELS: Record<string, string> = {
  'assessment.submit': 'Demande envoyée par la cliente',
  'assessment.decision.accept': 'Compatibilité acceptée',
  'assessment.decision.refuse': 'Prestation refusée',
  'assessment.decision.request_info': 'Informations complémentaires demandées',
  'assessment.decision.propose_alternative': 'Autre coiffure proposée',
  'assessment.decision.allow_conditional': 'Réservation autorisée sous conditions',
};

const TERMINAL_STATUSES = new Set(['ACCEPTED', 'REFUSED', 'CONFIRMED']);

function formatAnswer(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(', ');
  if (typeof value === 'boolean') return value ? 'Oui' : 'Non';
  if (value == null || value === '') return 'Non renseigné';
  return String(value);
}

export default async function AssessmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireAdmin();
  const { id } = await params;
  if (!user) redirect(`/connexion?callbackUrl=/dashboard/evaluations/${id}`);

  const detail = await getAssessmentDetail(id);
  if (!detail) notFound();

  const [photos, history] = await Promise.all([
    signedPrivatePhotos(detail.photoKeys),
    listAuditLogsForEntity('HairAssessment', detail.id),
  ]);
  const engine = evaluateCompatibility({
    rule: detail.rule,
    answers: assessmentEngineAnswers(detail.answers),
  });
  const questionByKey = new Map(detail.questions.map((question) => [question.key, question]));
  const terminal = TERMINAL_STATUSES.has(detail.status);

  const answerRows = Object.entries(detail.answers).map(([key, value]) => {
    const question = questionByKey.get(key);
    const optionLabel = question?.options.find((option) => option.value === String(value))?.label;
    return {
      key,
      label: question?.label ?? key,
      value: optionLabel ?? formatAnswer(value),
    };
  });

  return (
    <div className="p-6">
      <nav aria-label="Fil d'Ariane" className="text-sm text-ink-soft">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/dashboard/evaluations" className="transition hover:text-cacao">
              Évaluations
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <span aria-current="page" className="font-medium text-ink">
              {detail.customer?.name ?? 'Demande'}
            </span>
          </li>
        </ol>
      </nav>

      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">
              Évaluation pour {detail.customer?.name ?? 'une cliente'}
            </h1>
            <Badge tone={STATUS_TONES[detail.status] ?? 'neutral'}>
              {ASSESSMENT_STATUS_LABELS[detail.status] ?? detail.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-ink-soft">
            Demandée le {dateFormatter.format(detail.createdAt)} ·{' '}
            <Link
              href={`/dashboard/catalogue/prestations/${detail.serviceId}`}
              className="font-semibold text-cacao underline-offset-4 hover:underline"
            >
              {detail.serviceName}
            </Link>{' '}
            ·{' '}
            <Link
              href={`/compatibilite?service=${detail.serviceSlug}`}
              className="underline-offset-4 hover:underline"
            >
              parcours public
            </Link>
          </p>
          {detail.decidedAt ? (
            <p className="mt-1 text-sm text-ink-soft">
              Décision du {dateFormatter.format(detail.decidedAt)}
              {detail.decidedByName ? ` par ${detail.decidedByName}` : ''}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card>
            <h2 className="font-heading text-xl font-bold text-ink">Coordonnées de la cliente</h2>
            {detail.customer ? (
              <dl className="mt-3 space-y-2 text-sm">
                <div className="flex flex-wrap gap-2">
                  <dt className="font-semibold">Nom :</dt>
                  <dd>{detail.customer.name}</dd>
                </div>
                <div className="flex flex-wrap gap-2">
                  <dt className="font-semibold">E-mail :</dt>
                  <dd>
                    <a
                      href={`mailto:${detail.customer.email}`}
                      className="text-cacao underline-offset-4 hover:underline"
                    >
                      {detail.customer.email}
                    </a>
                  </dd>
                </div>
                <div className="flex flex-wrap gap-2">
                  <dt className="font-semibold">Téléphone :</dt>
                  <dd>
                    <a
                      href={`tel:${detail.customer.phone.replace(/\s+/g, '')}`}
                      className="text-cacao underline-offset-4 hover:underline"
                    >
                      {detail.customer.phone}
                    </a>
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-2 text-sm text-ink-soft">Coordonnées non renseignées.</p>
            )}
          </Card>

          <Card>
            <h2 className="font-heading text-xl font-bold text-ink">Réponses capillaires</h2>
            {answerRows.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">Aucune réponse enregistrée.</p>
            ) : (
              <dl className="mt-3 divide-y divide-cream-dark">
                {answerRows.map((row) => (
                  <div
                    key={row.key}
                    className="flex flex-col gap-1 py-2 sm:flex-row sm:justify-between"
                  >
                    <dt className="text-sm font-semibold text-ink">{row.label}</dt>
                    <dd className="text-sm text-ink-soft sm:text-right">{row.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {detail.decisionNote ? (
              <div className="mt-4 rounded-[var(--radius-md)] bg-cream-dark px-4 py-3 text-sm text-ink">
                <p className="font-semibold">Note / commentaire</p>
                <p className="mt-1 whitespace-pre-line">{detail.decisionNote}</p>
              </div>
            ) : null}
          </Card>

          <Card>
            <h2 className="font-heading text-xl font-bold text-ink">Photos privées</h2>
            {photos.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">Aucune photo envoyée.</p>
            ) : (
              <ul className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {photos.map((photo, index) => (
                  <li
                    key={photo.key}
                    className="overflow-hidden rounded-[var(--radius-md)] border border-cream-dark bg-cream-dark"
                  >
                    {photo.url ? (
                      <a href={photo.url} target="_blank" rel="noreferrer" className="block">
                        {/* URL signée privée, impossible à déclarer dans next/image. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photo.url}
                          alt={`Photo capillaire ${index + 1} de la cliente`}
                          className="aspect-square w-full object-cover"
                        />
                      </a>
                    ) : (
                      <p className="p-4 text-xs text-ink-soft">
                        Aperçu indisponible (stockage non configuré ou URL expirée).
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-ink-soft">
              Ces photos ne sont jamais publiées dans la galerie publique et ne sont accessibles
              qu’aux personnes habilitées.
            </p>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <h2 className="font-heading text-xl font-bold text-ink">Analyse automatique</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge
                tone={
                  engine.verdict === 'COMPATIBLE'
                    ? 'success'
                    : engine.verdict === 'INCOMPATIBLE'
                      ? 'alert'
                      : 'neutral'
                }
              >
                {engine.verdict === 'COMPATIBLE'
                  ? 'Compatible'
                  : engine.verdict === 'INCOMPATIBLE'
                    ? 'Incompatible'
                    : 'À vérifier'}
              </Badge>
              {engine.requiresManualReview ? (
                <Badge tone="neutral">Validation manuelle requise</Badge>
              ) : null}
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {engine.message}
            </p>
            {engine.conditionsNote ? (
              <p className="mt-3 rounded-[var(--radius-md)] bg-accent-soft px-4 py-3 text-sm text-ink">
                {engine.conditionsNote}
              </p>
            ) : null}
          </Card>

          <Card>
            <h2 className="font-heading text-xl font-bold text-ink">Décision</h2>
            {detail.decisionMessage ? (
              <div className="mt-3 rounded-[var(--radius-md)] bg-cream-dark px-4 py-3 text-sm">
                <p className="font-semibold text-ink">Message transmis à la cliente</p>
                <p className="mt-1 whitespace-pre-line text-ink-soft">{detail.decisionMessage}</p>
              </div>
            ) : null}
            <div className="mt-4">
              <DecisionForm assessmentId={detail.id} terminal={terminal} />
            </div>
          </Card>

          <Card>
            <h2 className="font-heading text-xl font-bold text-ink">Historique</h2>
            {history.length === 0 ? (
              <p className="mt-2 text-sm text-ink-soft">Aucune action enregistrée.</p>
            ) : (
              <ol className="mt-3 space-y-3">
                {history.map((entry) => (
                  <li key={entry.id} className="border-b border-cream-dark pb-3 last:border-0">
                    <p className="text-sm font-semibold text-ink">
                      {ACTION_LABELS[entry.action] ??
                        ASSESSMENT_DECISION_LABELS[
                          entry.action
                            .replace('assessment.decision.', '')
                            .toUpperCase() as keyof typeof ASSESSMENT_DECISION_LABELS
                        ] ??
                        entry.action}
                    </p>
                    <p className="text-xs text-ink-soft">
                      {dateFormatter.format(entry.createdAt)}
                      {entry.userName ? ` · ${entry.userName}` : ''}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

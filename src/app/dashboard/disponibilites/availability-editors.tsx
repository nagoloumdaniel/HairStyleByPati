'use client';

import { useActionState, useEffect, useState } from 'react';
import {
  adminCreateBlockedPeriod,
  adminDeleteBlockedPeriod,
  adminDeleteSpecificRule,
  adminSaveSettings,
  adminSaveSpecificRule,
  adminSaveWeeklyRule,
  type AvailabilityActionState,
} from '@/modules/disponibilites/actions';
import { LocalDateTime } from '@/components/shared/LocalDateTime';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

/* ============================================================
 * P6.10 : édition des disponibilités et paramètres de réservation.
 * Les avertissements de conflit sont renvoyés par le serveur.
 * ============================================================ */

const WEEKDAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

export interface WeeklyRuleView {
  id: string;
  weekday: number;
  startMinute: number;
  endMinute: number;
}

export interface SpecificRuleView {
  id: string;
  date: string;
  startMinute: number;
  endMinute: number;
}

export interface BlockedPeriodView {
  id: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
  createdByName: string | null;
}

export interface BookingSettingsView {
  holdSlotMinutes: number;
  minCancelNoticeHours: number;
  reminderLeadHours: number;
  bufferMinutes: number;
  slotIntervalMinutes: number;
  maxAdvanceDays: number;
  minLeadTimeMinutes: number;
  cancelReasonRequired: boolean;
  dataRetentionMonths: number;
  photoRetentionDays: number;
}

function timeValue(minutes: number): string {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(
    2,
    '0',
  )}`;
}

function useDeviceTimeZone(): string {
  const [timeZone, setTimeZone] = useState('Africa/Dakar');
  useEffect(() => {
    try {
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Dakar');
    } catch {
      setTimeZone('Africa/Dakar');
    }
  }, []);
  return timeZone;
}

function ConflictCheckbox() {
  return (
    <label className="flex items-start gap-2 text-xs text-muted">
      <input type="checkbox" name="confirmConflicts" className="mt-0.5 size-3.5" />
      Confirmer même si des rendez-vous existent déjà sur ce créneau.
    </label>
  );
}

function Feedback({ state }: { state: AvailabilityActionState }) {
  return (
    <>
      {state.error ? (
        <p
          role="alert"
          className="mt-2 rounded-[var(--radius-sm)] bg-alert-soft px-3 py-2 text-xs font-medium text-alert"
        >
          {state.error}
        </p>
      ) : null}
      {state.success ? (
        <p
          role="status"
          className="mt-2 rounded-[var(--radius-sm)] bg-success-soft px-3 py-2 text-xs font-medium text-success"
        >
          {state.success}
        </p>
      ) : null}
    </>
  );
}

function WeekdayForm({
  weekday,
  rule,
  timeZone,
}: {
  weekday: number;
  rule: WeeklyRuleView | null;
  timeZone: string;
}) {
  const [state, formAction, pending] = useActionState<AvailabilityActionState, FormData>(
    adminSaveWeeklyRule,
    {},
  );
  const [active, setActive] = useState(Boolean(rule));

  return (
    <form action={formAction} className="rounded-[var(--radius-md)] border border-line p-3">
      <input type="hidden" name="weekday" value={weekday} />
      <input type="hidden" name="timeZone" value={timeZone} />
      <div className="flex flex-wrap items-end gap-3">
        <div className="w-24">
          <Input
            label="Début"
            name="start"
            type="time"
            defaultValue={timeValue(rule?.startMinute ?? 540)}
            required
          />
        </div>
        <div className="w-24">
          <Input
            label="Fin"
            name="end"
            type="time"
            defaultValue={timeValue(rule?.endMinute ?? 1080)}
            required
          />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm font-semibold">
          <input
            type="checkbox"
            name="active"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="size-4"
          />
          Ouvert
        </label>
        <Button type="submit" variant="secondary" size="sm" loading={pending}>
          Enregistrer
        </Button>
      </div>
      <div className="mt-2">
        <ConflictCheckbox />
      </div>
      <Feedback state={state} />
    </form>
  );
}

export function WeeklyScheduleEditor({ rules }: { rules: WeeklyRuleView[] }) {
  const timeZone = useDeviceTimeZone();
  return (
    <div className="flex flex-col gap-2">
      {WEEKDAYS.map((label, weekday) => (
        <div key={label}>
          <p className="mb-1 text-sm font-semibold text-fg">{label}</p>
          <WeekdayForm
            weekday={weekday}
            rule={rules.find((rule) => rule.weekday === weekday) ?? null}
            timeZone={timeZone}
          />
        </div>
      ))}
    </div>
  );
}

export function SpecificDatesEditor({ rules }: { rules: SpecificRuleView[] }) {
  const timeZone = useDeviceTimeZone();
  const [state, formAction, pending] = useActionState<AvailabilityActionState, FormData>(
    adminSaveSpecificRule,
    {},
  );
  const [active, setActive] = useState(true);

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="timeZone" value={timeZone} />
        <div className="w-40">
          <Input label="Date" name="dateISO" type="date" required />
        </div>
        <div className="w-24">
          <Input label="Début" name="start" type="time" defaultValue="09:00" required />
        </div>
        <div className="w-24">
          <Input label="Fin" name="end" type="time" defaultValue="18:00" required />
        </div>
        <label className="flex items-center gap-2 pb-2 text-sm font-semibold">
          <input
            type="checkbox"
            name="active"
            checked={active}
            onChange={(event) => setActive(event.target.checked)}
            className="size-4"
          />
          Ouvert
        </label>
        <Button type="submit" size="sm" loading={pending}>
          Enregistrer l’exception
        </Button>
      </form>
      <ConflictCheckbox />
      <Feedback state={state} />

      {rules.length === 0 ? (
        <p className="text-sm text-muted">Aucune exception de date.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {rules.map((rule) => (
            <li
              key={rule.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-line bg-card p-3"
            >
              <p className="text-sm">
                <span className="font-semibold">
                  {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' }).format(
                    new Date(`${rule.date}T12:00:00`),
                  )}
                </span>{' '}
                · {timeValue(rule.startMinute)} – {timeValue(rule.endMinute)}
              </p>
              <DeleteSpecificButton id={rule.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DeleteSpecificButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState<AvailabilityActionState, FormData>(
    adminDeleteSpecificRule,
    {},
  );
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="danger" size="sm" loading={pending}>
        Supprimer
      </Button>
      <Feedback state={state} />
    </form>
  );
}

export function BlockedPeriodsEditor({ periods }: { periods: BlockedPeriodView[] }) {
  const timeZone = useDeviceTimeZone();
  const [state, formAction, pending] = useActionState<AvailabilityActionState, FormData>(
    adminCreateBlockedPeriod,
    {},
  );

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-3">
        <input type="hidden" name="timeZone" value={timeZone} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Début" name="startsAtLocal" type="datetime-local" required />
          <Input label="Fin" name="endsAtLocal" type="datetime-local" required />
        </div>
        <Textarea
          label="Motif (facultatif)"
          name="reason"
          rows={2}
          hint="Exemple : pause déjeuner, congé, rendez-vous personnel."
        />
        <ConflictCheckbox />
        <Button type="submit" size="sm" loading={pending} className="self-start">
          Bloquer cette période
        </Button>
      </form>
      <Feedback state={state} />

      {periods.length === 0 ? (
        <p className="text-sm text-muted">Aucune indisponibilité enregistrée.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {periods.map((period) => (
            <li
              key={period.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-[var(--radius-md)] border border-line bg-card p-3"
            >
              <div className="text-sm">
                <p className="font-semibold">
                  <LocalDateTime iso={period.startsAt} /> → <LocalDateTime iso={period.endsAt} />
                </p>
                <p className="text-muted">
                  {period.reason || 'Sans motif'}
                  {period.createdByName ? ` · ${period.createdByName}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="alert">Indisponible</Badge>
                <DeleteBlockedButton id={period.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DeleteBlockedButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState<AvailabilityActionState, FormData>(
    adminDeleteBlockedPeriod,
    {},
  );
  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" variant="ghost" size="sm" loading={pending}>
        Supprimer
      </Button>
      <Feedback state={state} />
    </form>
  );
}

export function BookingSettingsEditor({ settings }: { settings: BookingSettingsView }) {
  const [state, formAction, pending] = useActionState<AvailabilityActionState, FormData>(
    adminSaveSettings,
    {},
  );
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Input
          label="Durée de maintien d’un créneau en attente (min)"
          name="holdSlotMinutes"
          type="number"
          min={0}
          max={1440}
          defaultValue={settings.holdSlotMinutes}
          hint="0 = pas de libération automatique."
        />
        <Input
          label="Délai minimum d’annulation (h)"
          name="minCancelNoticeHours"
          type="number"
          min={0}
          max={720}
          defaultValue={settings.minCancelNoticeHours}
        />
        <Input
          label="Rappel avant rendez-vous (h)"
          name="reminderLeadHours"
          type="number"
          min={0}
          max={720}
          defaultValue={settings.reminderLeadHours}
        />
        <Input
          label="Marge entre deux prestations (min)"
          name="bufferMinutes"
          type="number"
          min={0}
          max={240}
          defaultValue={settings.bufferMinutes}
        />
        <Input
          label="Intervalle des créneaux (min)"
          name="slotIntervalMinutes"
          type="number"
          min={5}
          max={120}
          defaultValue={settings.slotIntervalMinutes}
        />
        <Input
          label="Horizon de réservation (jours)"
          name="maxAdvanceDays"
          type="number"
          min={1}
          max={365}
          defaultValue={settings.maxAdvanceDays}
        />
        <Input
          label="Délai minimum avant réservation (min)"
          name="minLeadTimeMinutes"
          type="number"
          min={0}
          max={10080}
          defaultValue={settings.minLeadTimeMinutes}
        />
        <Input
          label="Conservation des données (mois)"
          name="dataRetentionMonths"
          type="number"
          min={1}
          max={120}
          defaultValue={settings.dataRetentionMonths}
          hint="Durée indicative pour les données clientes et l’historique."
        />
        <Input
          label="Conservation des photos privées (jours)"
          name="photoRetentionDays"
          type="number"
          min={7}
          max={3650}
          defaultValue={settings.photoRetentionDays}
          hint="Les photos d’évaluation et de demande sont purgées après ce délai."
        />
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input
          type="checkbox"
          name="cancelReasonRequired"
          defaultChecked={settings.cancelReasonRequired}
          className="size-4"
        />
        Motif obligatoire pour l’annulation client
      </label>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" loading={pending}>
          Enregistrer les paramètres
        </Button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

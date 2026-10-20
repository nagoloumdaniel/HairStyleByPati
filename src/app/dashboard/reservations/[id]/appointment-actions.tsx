'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { AppointmentStatus } from '@prisma/client';
import {
  adminCancelAppointment,
  adminLoadRescheduleSlots,
  adminRescheduleAppointment,
  adminTransitionAppointment,
  type AppointmentActionState,
  type RescheduleSlotsState,
} from '@/modules/reservations/actions';
import { isActiveAppointmentStatus } from '@/modules/reservations/status';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';

/* ============================================================
 * P6.5 / P6.6 / P6.8 : actions de Patricia sur un rendez-vous.
 * Les transitions et la disponibilité sont contrôlées serveur.
 * ============================================================ */

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function isoFromDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function timeLabel(startMinute: number): string {
  return `${pad(Math.floor(startMinute / 60))}:${pad(startMinute % 60)}`;
}

export function AppointmentActions({
  appointmentId,
  status,
}: {
  appointmentId: string;
  status: AppointmentStatus;
}) {
  const router = useRouter();
  const [transitionState, transitionAction, transitionPending] = useActionState<
    AppointmentActionState,
    FormData
  >(adminTransitionAppointment, {});
  const [cancelState, cancelAction, cancelPending] = useActionState<
    AppointmentActionState,
    FormData
  >(adminCancelAppointment, {});
  const [rescheduleState, rescheduleAction, reschedulePending] = useActionState<
    AppointmentActionState,
    FormData
  >(adminRescheduleAppointment, {});
  const [slotState, slotFormAction, slotPending] = useActionState<RescheduleSlotsState, FormData>(
    adminLoadRescheduleSlots,
    {},
  );
  const [dateISO, setDateISO] = useState('');
  const [timeZone, setTimeZone] = useState('Africa/Dakar');
  const [selectedSlot, setSelectedSlot] = useState<{
    startsAt: string;
    startMinute: number;
  } | null>(null);
  const slotFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    setDateISO(isoFromDate(date));
    try {
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Africa/Dakar');
    } catch {
      setTimeZone('Africa/Dakar');
    }
  }, []);

  useEffect(() => {
    if (!dateISO || !timeZone) return;
    const timer = window.setTimeout(() => slotFormRef.current?.requestSubmit(), 100);
    return () => window.clearTimeout(timer);
  }, [dateISO, timeZone]);

  useEffect(() => {
    if (transitionState.success || cancelState.success || rescheduleState.success) {
      router.refresh();
    }
  }, [transitionState.success, cancelState.success, rescheduleState.success, router]);

  if (!isActiveAppointmentStatus(status)) {
    return (
      <p className="rounded-[var(--radius-md)] bg-line px-4 py-3 text-sm text-muted">
        Ce rendez-vous est clos. Les actions de modification ne sont plus disponibles.
      </p>
    );
  }

  const canConfirm = status === 'PENDING' || status === 'RESCHEDULED';
  const canClose = status === 'CONFIRMED' || status === 'RESCHEDULED';
  const error =
    transitionState.error ?? cancelState.error ?? rescheduleState.error ?? slotState.error;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {canConfirm ? (
          <form action={transitionAction}>
            <input type="hidden" name="appointmentId" value={appointmentId} />
            <input type="hidden" name="status" value="CONFIRMED" />
            <Button type="submit" size="sm" loading={transitionPending}>
              Confirmer le rendez-vous
            </Button>
          </form>
        ) : null}
        {canClose ? (
          <>
            <form action={transitionAction}>
              <input type="hidden" name="appointmentId" value={appointmentId} />
              <input type="hidden" name="status" value="COMPLETED" />
              <Button type="submit" variant="secondary" size="sm" loading={transitionPending}>
                Marquer terminé
              </Button>
            </form>
            <form action={transitionAction}>
              <input type="hidden" name="appointmentId" value={appointmentId} />
              <input type="hidden" name="status" value="NO_SHOW" />
              <Button type="submit" variant="ghost" size="sm" loading={transitionPending}>
                Cliente absente
              </Button>
            </form>
          </>
        ) : null}
      </div>

      <section className="rounded-[var(--radius-md)] border border-line p-4">
        <h3 className="font-semibold text-fg">Annuler le rendez-vous</h3>
        <form action={cancelAction} className="mt-3 flex flex-col gap-3">
          <input type="hidden" name="appointmentId" value={appointmentId} />
          <Textarea
            label="Motif communiqué à la cliente (facultatif)"
            name="reason"
            rows={2}
            hint="Le motif est conservé dans l’historique et inclus dans la notification."
          />
          <Button type="submit" variant="danger" size="sm" loading={cancelPending}>
            Annuler le rendez-vous
          </Button>
        </form>
      </section>

      <section className="rounded-[var(--radius-md)] border border-line p-4">
        <h3 className="font-semibold text-fg">Reprogrammer</h3>
        <p className="mt-1 text-sm text-muted">
          L’ancien créneau n’est libéré qu’après validation du nouveau.
        </p>
        <div className="mt-3 max-w-xs">
          <Input
            label="Nouvelle date"
            type="date"
            value={dateISO}
            min={isoFromDate(new Date())}
            onChange={(event) => {
              setDateISO(event.target.value);
              setSelectedSlot(null);
            }}
          />
        </div>
        <form ref={slotFormRef} action={slotFormAction} className="hidden">
          <input type="hidden" name="appointmentId" value={appointmentId} />
          <input type="hidden" name="dateISO" value={dateISO} />
          <input type="hidden" name="timeZone" value={timeZone} />
        </form>
        <div className="mt-3" aria-live="polite">
          {slotPending ? (
            <p className="text-sm text-muted">Recherche des créneaux…</p>
          ) : !slotState.slots || slotState.slots.length === 0 ? (
            <p className="text-sm text-muted">Aucun créneau disponible ce jour.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {slotState.slots.map((slot) => (
                <button
                  key={slot.startsAt}
                  type="button"
                  aria-pressed={selectedSlot?.startsAt === slot.startsAt}
                  onClick={() =>
                    setSelectedSlot({ startsAt: slot.startsAt, startMinute: slot.startMinute })
                  }
                  className={`rounded-[var(--radius-sm)] border px-2 py-2 text-sm font-semibold transition ${
                    selectedSlot?.startsAt === slot.startsAt
                      ? 'border-cacao bg-cacao text-cacao-fg'
                      : 'border-line hover:border-cacao'
                  }`}
                >
                  {timeLabel(slot.startMinute)}
                </button>
              ))}
            </div>
          )}
        </div>
        <form action={rescheduleAction} className="mt-3 flex flex-col gap-3">
          <input type="hidden" name="appointmentId" value={appointmentId} />
          <input type="hidden" name="dateISO" value={dateISO} />
          <input type="hidden" name="timeZone" value={timeZone} />
          <input type="hidden" name="startsAt" value={selectedSlot?.startsAt ?? ''} />
          <Button
            type="submit"
            variant="secondary"
            size="sm"
            disabled={!selectedSlot}
            loading={reschedulePending}
          >
            Valider la reprogrammation
          </Button>
        </form>
      </section>

      {error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] bg-alert-soft px-4 py-3 text-sm text-alert"
        >
          {error}
        </p>
      ) : null}
      {(transitionState.success ?? cancelState.success ?? rescheduleState.success) ? (
        <p
          role="status"
          className="rounded-[var(--radius-md)] bg-success-soft px-4 py-3 text-sm text-success"
        >
          {transitionState.success ?? cancelState.success ?? rescheduleState.success}
        </p>
      ) : null}
    </div>
  );
}

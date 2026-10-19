'use client';

import Link from 'next/link';
import { useActionState, useEffect, useRef, useState } from 'react';
import type { AppointmentStatus } from '@prisma/client';
import { utcToDeviceParts } from '@/lib/dates';
import { loadCalendarData, type CalendarState } from '@/modules/reservations/actions';
import {
  APPOINTMENT_STATUS_SHORT_LABELS,
  APPOINTMENT_STATUS_TONES,
} from '@/modules/reservations/status';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

/* ============================================================
 * P6.9 : calendrier dashboard jour / semaine / mois / liste.
 * Les données viennent du serveur, l'affichage suit l'heure
 * locale de l'appareil connecté.
 * ============================================================ */

type View = 'day' | 'week' | 'month' | 'list';

const VIEW_LABELS: Record<View, string> = {
  day: 'Jour',
  week: 'Semaine',
  month: 'Mois',
  list: 'Liste',
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function isoFromDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseISO(dateISO: string): Date {
  const [year, month, day] = dateISO.split('-').map(Number);
  return new Date(year ?? 2026, (month ?? 1) - 1, day ?? 1);
}

function addDays(dateISO: string, days: number): string {
  const date = parseISO(dateISO);
  date.setDate(date.getDate() + days);
  return isoFromDate(date);
}

function addMonths(dateISO: string, months: number): string {
  const date = parseISO(dateISO);
  date.setMonth(date.getMonth() + months);
  return isoFromDate(date);
}

function timeLabel(iso: string, timeZone: string): string {
  const parts = utcToDeviceParts(new Date(iso), timeZone);
  return `${pad(Math.floor(parts.minute / 60))}:${pad(parts.minute % 60)}`;
}

function dayLabel(iso: string, timeZone: string): string {
  const parts = utcToDeviceParts(new Date(iso), timeZone);
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${parts.dateISO}T12:00:00`));
}

interface CalendarEntry {
  id: string;
  status: AppointmentStatus;
  startsAt: string;
  endsAt: string;
  customerName: string;
  serviceName: string;
  priceCents: number | null;
}

export function CalendarClient() {
  const [view, setView] = useState<View>('week');
  const [dateISO, setDateISO] = useState('');
  const [timeZone, setTimeZone] = useState('Europe/Paris');
  const [state, formAction, pending] = useActionState<CalendarState, FormData>(
    loadCalendarData,
    {},
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setDateISO(isoFromDate(new Date()));
    try {
      setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Paris');
    } catch {
      setTimeZone('Europe/Paris');
    }
  }, []);

  useEffect(() => {
    if (!dateISO || !timeZone) return;
    const timer = window.setTimeout(() => formRef.current?.requestSubmit(), 80);
    return () => window.clearTimeout(timer);
  }, [view, dateISO, timeZone]);

  const go = (direction: -1 | 1) => {
    if (view === 'day') setDateISO(addDays(dateISO, direction));
    else if (view === 'week') setDateISO(addDays(dateISO, direction * 7));
    else if (view === 'month') setDateISO(addMonths(dateISO, direction));
    else setDateISO(addDays(dateISO, direction * 7));
  };

  const appointments: CalendarEntry[] = state.appointments ?? [];
  const byDay = new Map<string, CalendarEntry[]>();
  for (const appointment of appointments) {
    const parts = utcToDeviceParts(new Date(appointment.startsAt), timeZone);
    const list = byDay.get(parts.dateISO) ?? [];
    list.push(appointment);
    byDay.set(parts.dateISO, list);
  }
  for (const list of byDay.values()) {
    list.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  }

  const weekStartISO = state.rangeStartISO
    ? utcToDeviceParts(new Date(state.rangeStartISO), timeZone).dateISO
    : dateISO;

  const monthDays = Array.from({ length: 42 }, (_, index) => addDays(weekStartISO, index));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setDateISO(isoFromDate(new Date()))}
          >
            Aujourd’hui
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Période précédente"
            onClick={() => go(-1)}
          >
            ←
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            aria-label="Période suivante"
            onClick={() => go(1)}
          >
            →
          </Button>
          <p className="ml-2 font-heading text-lg font-bold text-ink">
            {view === 'month'
              ? new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(
                  parseISO(dateISO || isoFromDate(new Date())),
                )
              : view === 'week' && state.rangeStartISO
                ? `Semaine du ${dayLabel(state.rangeStartISO, timeZone)}`
                : dateISO
                  ? new Intl.DateTimeFormat('fr-FR', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    }).format(parseISO(dateISO))
                  : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-1 rounded-[var(--radius-full)] bg-cream-dark p-1">
          {(Object.keys(VIEW_LABELS) as View[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setView(item)}
              aria-pressed={view === item}
              className={`rounded-[var(--radius-full)] px-3 py-1.5 text-sm font-semibold transition ${
                view === item ? 'bg-ink text-cream' : 'text-ink-soft hover:text-ink'
              }`}
            >
              {VIEW_LABELS[item]}
            </button>
          ))}
        </div>
      </div>

      <form ref={formRef} action={formAction} className="hidden">
        <input type="hidden" name="view" value={view} />
        <input type="hidden" name="dateISO" value={dateISO} />
        <input type="hidden" name="timeZone" value={timeZone} />
      </form>

      {state.error ? (
        <p
          role="alert"
          className="rounded-[var(--radius-md)] bg-alert-soft px-4 py-3 text-sm text-alert"
        >
          {state.error}
        </p>
      ) : pending ? (
        <p className="rounded-[var(--radius-md)] bg-cream-dark px-4 py-3 text-sm text-ink-soft">
          Chargement du calendrier…
        </p>
      ) : null}

      {view === 'day' ? (
        <Card className="p-4">
          <div className="divide-y divide-cream-dark">
            {Array.from({ length: 14 }, (_, index) => index + 7).map((hour) => {
              const entries = (byDay.get(dateISO) ?? []).filter((appointment) => {
                const parts = utcToDeviceParts(new Date(appointment.startsAt), timeZone);
                return Math.floor(parts.minute / 60) === hour;
              });
              return (
                <div key={hour} className="flex gap-3 py-2">
                  <span className="w-14 shrink-0 text-xs font-semibold text-ink-soft">
                    {pad(hour)}:00
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    {entries.length === 0 ? (
                      <span className="text-xs text-ink-soft/50">Libre</span>
                    ) : (
                      entries.map((appointment) => (
                        <Link
                          key={appointment.id}
                          href={`/dashboard/reservations/${appointment.id}`}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-[var(--radius-sm)] border border-cream-dark bg-surface px-3 py-2 text-sm transition hover:border-cacao"
                        >
                          <span className="min-w-0">
                            <span className="font-semibold">
                              {timeLabel(appointment.startsAt, timeZone)}
                            </span>{' '}
                            <span className="text-ink-soft">
                              {appointment.customerName} · {appointment.serviceName}
                            </span>
                          </span>
                          <Badge tone={APPOINTMENT_STATUS_TONES[appointment.status] ?? 'neutral'}>
                            {APPOINTMENT_STATUS_SHORT_LABELS[appointment.status] ??
                              appointment.status}
                          </Badge>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      ) : null}

      {view === 'week' ? (
        <div className="overflow-x-auto">
          <div className="grid min-w-[900px] grid-cols-7 gap-2">
            {Array.from({ length: 7 }, (_, index) => {
              const dayISO = addDays(weekStartISO, index);
              const entries = byDay.get(dayISO) ?? [];
              const isToday = dayISO === isoFromDate(new Date());
              return (
                <div
                  key={dayISO}
                  className={`rounded-[var(--radius-md)] border p-2 ${
                    isToday ? 'border-cacao bg-accent-soft/40' : 'border-cream-dark bg-surface'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setDateISO(dayISO);
                      setView('day');
                    }}
                    className="w-full text-left text-xs font-semibold uppercase tracking-wide text-ink-soft hover:text-cacao"
                  >
                    {new Intl.DateTimeFormat('fr-FR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                    }).format(parseISO(dayISO))}
                  </button>
                  <div className="mt-2 flex min-h-24 flex-col gap-1.5">
                    {entries.length === 0 ? (
                      <p className="text-xs text-ink-soft/60">Aucun rendez-vous</p>
                    ) : (
                      entries.map((appointment) => (
                        <Link
                          key={appointment.id}
                          href={`/dashboard/reservations/${appointment.id}`}
                          className="rounded-[var(--radius-sm)] border border-cream-dark bg-cream px-2 py-1.5 text-xs transition hover:border-cacao"
                        >
                          <span className="block font-semibold">
                            {timeLabel(appointment.startsAt, timeZone)}
                          </span>
                          <span className="block truncate text-ink-soft">
                            {appointment.customerName}
                          </span>
                          <span className="block truncate text-ink-soft">
                            {appointment.serviceName}
                          </span>
                          <span className="mt-1 block">
                            <Badge tone={APPOINTMENT_STATUS_TONES[appointment.status] ?? 'neutral'}>
                              {APPOINTMENT_STATUS_SHORT_LABELS[appointment.status] ??
                                appointment.status}
                            </Badge>
                          </span>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {view === 'month' ? (
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-7 gap-1 pb-1 text-center text-xs font-semibold uppercase tracking-wide text-ink-soft">
              {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((dayISO) => {
                const entries = byDay.get(dayISO) ?? [];
                const inMonth = dayISO.slice(0, 7) === dateISO.slice(0, 7);
                return (
                  <button
                    key={dayISO}
                    type="button"
                    onClick={() => {
                      setDateISO(dayISO);
                      setView('day');
                    }}
                    className={`min-h-20 rounded-[var(--radius-sm)] border p-1.5 text-left align-top transition hover:border-cacao ${
                      inMonth
                        ? 'border-cream-dark bg-surface'
                        : 'border-cream-dark/50 bg-cream/50 opacity-60'
                    }`}
                  >
                    <span className="text-xs font-semibold">{Number(dayISO.slice(-2))}</span>
                    {entries.length > 0 ? (
                      <span className="mt-1 block text-xs text-cacao">{entries.length} RDV</span>
                    ) : null}
                    {entries.slice(0, 2).map((appointment) => (
                      <span
                        key={appointment.id}
                        className="mt-0.5 block truncate text-[11px] text-ink-soft"
                      >
                        {timeLabel(appointment.startsAt, timeZone)} {appointment.customerName}
                      </span>
                    ))}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}

      {view === 'list' ? (
        <Card className="p-0">
          {appointments.length === 0 ? (
            <p className="p-6 text-center text-ink-soft">Aucun rendez-vous sur cette période.</p>
          ) : (
            <ul className="divide-y divide-cream-dark">
              {appointments.map((appointment) => (
                <li
                  key={appointment.id}
                  className="flex flex-wrap items-center justify-between gap-3 p-4"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">
                      <span className="text-ink-soft">
                        {new Intl.DateTimeFormat('fr-FR', {
                          dateStyle: 'medium',
                        }).format(new Date(appointment.startsAt))}{' '}
                        · {timeLabel(appointment.startsAt, timeZone)}
                      </span>{' '}
                      {appointment.customerName}
                    </p>
                    <p className="text-sm text-ink-soft">{appointment.serviceName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge tone={APPOINTMENT_STATUS_TONES[appointment.status] ?? 'neutral'}>
                      {APPOINTMENT_STATUS_SHORT_LABELS[appointment.status] ?? appointment.status}
                    </Badge>
                    <Link
                      href={`/dashboard/reservations/${appointment.id}`}
                      className="text-sm font-semibold text-cacao underline-offset-4 hover:underline"
                    >
                      Ouvrir
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      <p className="text-xs text-ink-soft">
        Les couleurs de statut sont toujours accompagnées d’un libellé. Les horaires suivent l’heure
        locale de votre appareil.
      </p>
    </div>
  );
}

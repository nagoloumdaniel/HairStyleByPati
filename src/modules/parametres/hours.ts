/* Horaires de Patricia : de 5 h à 22 h au plus, 0 = lundi … 6 = dimanche (comme les disponibilités). */
export const OPENING_MIN = '05:00';
export const OPENING_MAX = '22:00';

export const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const;

export type OpeningDay = { weekday: number; open: string; close: string };

/** Lit les horaires enregistrés (JSON libre en base) ; valeurs par défaut si illisibles. */
export function readOpeningHours(raw: unknown): { days: number[]; open: string; close: string } {
  const fallback = { days: [0, 1, 2, 3, 4, 5, 6], open: OPENING_MIN, close: OPENING_MAX };
  if (!Array.isArray(raw)) return fallback;
  const rows = raw.filter(
    (row): row is OpeningDay =>
      !!row &&
      typeof row === 'object' &&
      Number.isInteger((row as OpeningDay).weekday) &&
      (row as OpeningDay).weekday >= 0 &&
      (row as OpeningDay).weekday <= 6 &&
      typeof (row as OpeningDay).open === 'string' &&
      typeof (row as OpeningDay).close === 'string',
  );
  const first = rows[0];
  if (!first) return fallback;
  const open = first.open >= OPENING_MIN && first.open < OPENING_MAX ? first.open : OPENING_MIN;
  const close = first.close <= OPENING_MAX && first.close > open ? first.close : OPENING_MAX;
  return { days: rows.map((row) => row.weekday), open, close };
}

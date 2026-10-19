import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/modules/auth/guards';
import {
  getSalonSettings,
  listAvailabilityRules,
  listBlockedPeriods,
} from '@/modules/disponibilites/queries';
import { Card } from '@/components/ui/Card';
import {
  BlockedPeriodsEditor,
  BookingSettingsEditor,
  SpecificDatesEditor,
  WeeklyScheduleEditor,
} from './availability-editors';

export const metadata: Metadata = { title: 'Disponibilités - Tableau de bord' };

export default async function DisponibilitesPage() {
  const user = await requireAdmin();
  if (!user) redirect('/connexion?callbackUrl=/dashboard/disponibilites');

  const [rules, blockedPeriods, settings] = await Promise.all([
    listAvailabilityRules(),
    listBlockedPeriods(),
    getSalonSettings(),
  ]);

  const weekly = rules
    .filter((rule) => rule.kind === 'WEEKLY' && rule.active)
    .map((rule) => ({
      id: rule.id,
      weekday: rule.weekday ?? 0,
      startMinute: rule.startMinute,
      endMinute: rule.endMinute,
    }));
  const specific = rules
    .filter((rule) => rule.kind === 'SPECIFIC' && rule.active && rule.date)
    .map((rule) => ({
      id: rule.id,
      date: rule.date as string,
      startMinute: rule.startMinute,
      endMinute: rule.endMinute,
    }));
  const blocked = blockedPeriods.map((period) => ({
    id: period.id,
    startsAt: period.startsAt.toISOString(),
    endsAt: period.endsAt.toISOString(),
    reason: period.reason,
    createdByName: period.createdBy.name,
  }));

  return (
    <div className="p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">Disponibilités</h1>
        <p className="text-ink-soft">
          Horaires habituels, exceptions, pauses et paramètres de réservation. Toute modification
          qui touche des rendez-vous existants demande une confirmation explicite.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <h2 className="font-heading text-xl font-bold text-ink">Horaires habituels</h2>
          <p className="mb-4 mt-1 text-sm text-ink-soft">
            Un jour non coché est fermé. Une date spécifique remplace les horaires habituels.
          </p>
          <WeeklyScheduleEditor rules={weekly} />
        </Card>

        <Card>
          <h2 className="font-heading text-xl font-bold text-ink">Dates spécifiques</h2>
          <p className="mb-4 mt-1 text-sm text-ink-soft">
            Pour un horaire différent ou une ouverture exceptionnelle à une date précise.
          </p>
          <SpecificDatesEditor rules={specific} />
        </Card>

        <Card>
          <h2 className="font-heading text-xl font-bold text-ink">Indisponibilités</h2>
          <p className="mb-4 mt-1 text-sm text-ink-soft">
            Pauses, congés et blocages exceptionnels. Ils retirent les créneaux correspondants.
          </p>
          <BlockedPeriodsEditor periods={blocked} />
        </Card>

        <Card>
          <h2 className="font-heading text-xl font-bold text-ink">Paramètres de réservation</h2>
          <p className="mb-4 mt-1 text-sm text-ink-soft">
            Ces valeurs pilotent les créneaux, la validation manuelle et les annulations.
          </p>
          <BookingSettingsEditor settings={settings} />
        </Card>
      </div>
    </div>
  );
}

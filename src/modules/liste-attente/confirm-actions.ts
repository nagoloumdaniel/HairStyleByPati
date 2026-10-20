'use server';

import { AppError } from '@/lib/errors';
import { createBooking } from '@/modules/reservations/service';
import { bookingReference } from '@/modules/reservations/schemas';

export type ConfirmWaitlistState = { error?: string; success?: string; reference?: string };

export async function confirmWaitlistBookingAction(
  _prev: ConfirmWaitlistState,
  formData: FormData,
): Promise<ConfirmWaitlistState> {
  const serviceSlug = String(formData.get('serviceSlug') ?? '').trim();
  const startsAtISO = String(formData.get('startsAtISO') ?? '').trim();
  const dateISO = String(formData.get('dateISO') ?? '').trim();
  const timeZone = String(formData.get('timeZone') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const phone = String(formData.get('phone') ?? '').trim();
  const waitlistToken = String(formData.get('waitlistToken') ?? '').trim();

  if (!serviceSlug || !startsAtISO || !dateISO || !timeZone || !name || !email || !phone) {
    return { error: 'Informations manquantes.' };
  }

  try {
    const result = await createBooking({
      serviceSlug,
      dateISO,
      startsAt: new Date(startsAtISO),
      timeZone,
      name,
      email,
      phone,
      comment: '',
      answers: {},
      optionIds: [],
      waitlistToken,
    });
    return {
      success: 'Votre rendez-vous est confirmé.',
      reference: bookingReference(result.appointmentId),
    };
  } catch (error) {
    if (error instanceof AppError) return { error: error.message };
    console.error(error);
    return { error: 'Une erreur est survenue. Réessayez plus tard.' };
  }
}

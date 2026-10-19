'use server';

import { headers } from 'next/headers';
import { z } from 'zod';

import { db } from '@/lib/db';
import { parseInput } from '@/lib/errors';
import { rateLimit } from '@/lib/rate-limit';

const contactSchema = z.object({
  name: z.string().min(2, 'Nom requis (2 caractères minimum)').max(100),
  email: z.string().email('E-mail invalide').max(200),
  phone: z.string().min(8, 'Téléphone invalide').max(30).optional().default(''),
  subject: z.string().min(3, 'Sujet requis').max(200),
  message: z.string().min(10, 'Message trop court (10 caractères minimum)').max(2000),
  // Honeypot : champ caché, doit rester vide pour un humain.
  website: z.string().optional().default(''),
});

type ContactInput = z.infer<typeof contactSchema>;

export async function createConversation(
  _state: unknown,
  formData: FormData,
): Promise<{ ok: boolean; error?: string }> {
  const headersList = await headers();
  const forwarded = headersList.get('x-forwarded-for');
  const ip = forwarded ? (forwarded.split(',')[0] ?? '').trim() : 'unknown';

  // Rate limit : 5 envois par IP par fenêtre de 60 secondes.
  const limit = rateLimit(`contact:${ip}`, { max: 5, windowMs: 60_000 });
  if (!limit.allowed) {
    return { ok: false, error: 'Trop de requêtes, réessayez dans une minute.' };
  }

  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    raw[key] = value;
  });

  let input: ContactInput;
  try {
    input = parseInput(contactSchema, raw);
  } catch {
    return { ok: false, error: 'Données invalides.' };
  }

  // Honeypot : si rempli, c'est un bot -> succès silencieux, rien n'est enregistré.
  if (input.website.trim().length > 0) {
    return { ok: true };
  }

  try {
    await db.conversation.create({
      data: {
        subject: input.subject,
        messages: {
          create: {
            author: 'CUSTOMER',
            content:
              `Nom : ${input.name}\n` +
              `E-mail : ${input.email}\n` +
              `Téléphone : ${input.phone || 'non renseigné'}\n\n` +
              `${input.message}`,
          },
        },
      },
    });
    return { ok: true };
  } catch {
    return { ok: false, error: "Échec de l'enregistrement du message, réessayez." };
  }
}

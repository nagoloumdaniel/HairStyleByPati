import { z } from 'zod';

export const promotionSchema = z.object({
  name: z.string().trim().min(2, 'Nom requis (2 caractères minimum).').max(120),
  kind: z.enum(['PERCENT', 'FIXED']),
  // Pourcentage 1-100, ou montant fixe en euros (converti en centimes)
  value: z
    .string()
    .trim()
    .transform((value) => Number(value.replace(',', '.')))
    .refine((value) => Number.isFinite(value) && value > 0, {
      message: 'Valeur de réduction invalide.',
    }),
  startsAt: z.string().trim().min(1, 'Date de début requise.'),
  endsAt: z.string().trim().min(1, 'Date de fin requise.'),
  serviceIds: z
    .array(z.string().trim().min(1))
    .min(1, 'Sélectionnez au moins une prestation.')
    .max(100),
});

export type PromotionInput = z.infer<typeof promotionSchema>;

export const promotionIdSchema = z.object({ id: z.string().trim().min(1).max(64) });

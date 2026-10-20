import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { rateLimit } from '@/lib/rate-limit';
import { authConfig } from './auth.config';

const credentialsSchema = z.object({
  email: z.string().email('E-mail invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

const DUMMY_HASH = '$2b$10$TkaaGaapCpXjproisoFh8ODsB3AT.QiuJFDYXqcE/XWE3V.sFUwma';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Mot de passe', type: 'password' },
      },
      authorize: async (credentials, request) => {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        // P9.3 : limitation des tentatives de connexion par IP et par e-mail.
        const forwarded = request?.headers?.get('x-forwarded-for');
        const ip = forwarded ? (forwarded.split(',')[0] ?? '').trim() : 'unknown';
        const ipLimit = rateLimit(`login:ip:${ip}`, { max: 20, windowMs: 15 * 60_000 });
        const emailLimit = rateLimit(`login:email:${parsed.data.email}:${ip}`, {
          max: 10,
          windowMs: 15 * 60_000,
        });
        if (!ipLimit.allowed || !emailLimit.allowed) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email.toLowerCase() },
        });
        // Comparaison systématique (hash factice) : pas d'énumération par le temps de réponse.
        const valid = await compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH);
        if (!user || !valid) return null;

        return { id: user.id, name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
});

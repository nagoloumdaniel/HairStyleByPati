import type { NextAuthConfig } from 'next-auth';
import type { Role } from '@prisma/client';

/**
 * Configuration Auth.js partagée middleware (edge, sans Prisma) et
 * serveur (src/modules/auth/auth.ts). P1.7/P1.8.
 */
export const authConfig = {
  pages: {
    signIn: '/connexion',
  },
  session: {
    strategy: 'jwt',
  },
  // Pas de provider ici : le middleware ne doit jamais importer Prisma
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? '';
        session.user.role = (typeof token.role === 'string' ? token.role : 'ADMIN') as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;

/**
 * Typage strict des variables d'environnement (P0.6 + P0.7).
 *
 * Tout variable listée dans .env.example doit apparaître ici.
 * `tsc --noEmit` (pre-commit + CI) échoue sur toute lecture d'une
 * variable non déclarée : c'est le garde-fou des oublis de config.
 *
 * Toutes les variables non préfixées NEXT_PUBLIC_ restent côté serveur
 * et ne doivent jamais être lues dans un composant client (§15.1).
 */
declare namespace NodeJS {
  interface ProcessEnv {
    // --- Base de données (Neon / PostgreSQL) ---
    readonly DATABASE_URL: string;
    readonly DIRECT_URL: string;

    // --- Application ---
    readonly NEXT_PUBLIC_APP_URL: string;
    readonly SALON_TIMEZONE: string;
    readonly NEXT_PUBLIC_APP_LOCALE: string;

    // --- Authentification (Auth.js) ---
    readonly AUTH_SECRET: string;
    readonly AUTH_ADMIN_EMAIL: string;
    readonly TOKEN_SIGNATURE_SECRET: string;
    readonly CANCEL_LINK_TTL_HOURS: string;

    // --- Stockage fichiers (Cloudflare R2 / API S3) ---
    readonly S3_ENDPOINT: string;
    readonly S3_REGION: string;
    readonly S3_BUCKET: string;
    readonly S3_ACCESS_KEY_ID: string;
    readonly S3_SECRET_ACCESS_KEY: string;
    readonly SIGNED_URL_TTL_SECONDS: string;
    readonly UPLOAD_MAX_BYTES: string;
    readonly UPLOAD_ALLOWED_MIME: string;

    // --- E-mails (Resend) ---
    readonly RESEND_API_KEY: string;
    readonly EMAIL_FROM: string;
    readonly ADMIN_EMAIL: string;
    readonly REMINDER_LEAD_HOURS: string;

    // --- Monitoring (Sentry) ---
    readonly NEXT_PUBLIC_SENTRY_DSN?: string;
    readonly SENTRY_AUTH_TOKEN?: string;

    // --- Politique du salon ---
    readonly HOLD_SLOT_MINUTES: string;
    readonly MIN_CANCEL_NOTICE_HOURS: string;

    // --- Environnement (injected by Vercel / Node) ---
    readonly NODE_ENV?: 'development' | 'production' | 'test';
    readonly VERCEL?: string;
    readonly PORT?: string;
  }
}

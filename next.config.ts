import type { NextConfig } from 'next';

const isProduction = process.env.NODE_ENV === 'production';

/** Domaine du bucket S3/R2 (P4.4, P8.11) : présent seulement si configuré. */
function storageHostname(): string | null {
  const endpoint = process.env.S3_ENDPOINT;
  if (!endpoint) return null;
  try {
    return new URL(endpoint).hostname;
  } catch {
    return null;
  }
}

/** Sources d'images autorisées par la CSP : plus de https: générique. */
const imgSrc = [
  "'self'",
  'data:',
  'blob:',
  'https://images.pexels.com',
  // URLs signées du bucket R2 (path-style : <compte>.r2.cloudflarestorage.com) et hôte configuré.
  'https://*.r2.cloudflarestorage.com',
  ...(storageHostname() ? [`https://${storageHostname()}`] : []),
];

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
];

if (isProduction) {
  securityHeaders.push(
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
    {
      key: 'Content-Security-Policy',
      // Next.js injecte des scripts inline pour l'hydratation : 'unsafe-inline'
      // reste nécessaire pour les scripts et styles générés par le framework.
      value: [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'",
        "style-src 'self' 'unsafe-inline'",
        `img-src ${imgSrc.join(' ')}`,
        "font-src 'self' data:",
        "connect-src 'self'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
        'upgrade-insecure-requests',
      ].join('; '),
    },
  );
}

const nextConfig: NextConfig = {
  // Dossier de build alternatif (tests E2E) pour ne pas écraser le serveur de dev.
  distDir: process.env.NEXT_DIST_DIR || '.next',
  poweredByHeader: false,
  // P4.4 : les photos de prestation sont envoyées via server action.
  // La limite applicative reste de 5 Mo par fichier (voir image-validation.ts).
  // Évite le streaming des métadonnées dans le body pour les pages dynamiques.
  // Les balises title/description restent dans <head> pour les crawlers et Lighthouse.
  htmlLimitedBots: /.*/,
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      // URLs signées du bucket S3/R2 (P4.4, P8.11) : photos réelles de catalogue et de galerie.
      ...(storageHostname()
        ? [{ protocol: 'https' as const, hostname: storageHostname()!, pathname: '/**' }]
        : []),
    ],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;

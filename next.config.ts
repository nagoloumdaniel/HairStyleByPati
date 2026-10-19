import type { NextConfig } from 'next';

const isProduction = process.env.NODE_ENV === 'production';

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
        "img-src 'self' data: blob: https:",
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
  poweredByHeader: false,
  // P4.4 : les photos de prestation sont envoyées via server action.
  // La limite applicative reste de 5 Mo par fichier (voir image-validation.ts).
  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },
  images: {
    // Photos de démonstration en attendant les uploads S3 (P4.4).
    // Ajouter le domaine de stockage (R2/S3) ici quand les photos réelles arrivent.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;

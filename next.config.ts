import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // P4.4 : les photos de prestation sont envoyées via server action.
  // La limite applicative reste de 5 Mo (voir image-validation.ts).
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
};

export default nextConfig;

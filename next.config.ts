import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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

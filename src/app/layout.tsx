import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hairstyle by Patricia',
  description: 'Salon de coiffure spécialisé tresses, vanilles et locs — réservation en ligne.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}

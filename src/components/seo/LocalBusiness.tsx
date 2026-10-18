/**
 * P3.8 — Données structurées LocalBusiness (JSON-LD) pour le salon.
 * Aide les moteurs de recherche à afficher les infos du salon (nom, adresse,
 * horaires, téléphone) dans les résultats enrichis.
 */

export interface LocalBusinessData {
  name: string;
  address: {
    streetAddress: string;
    addressLocality: string;
    addressRegion: string;
    postalCode: string;
    addressCountry: string;
  };
  telephone: string;
  email: string;
  priceRange: string;
  servesCity: string;
  openingHours: Array<{ dayOfWeek: string; opens: string; closes: string }>;
}

export const LOCAL_BUSINESS: LocalBusinessData = {
  name: 'Hairstyle by Patricia',
  address: {
    streetAddress: '12 Rue de la Coiffure',
    addressLocality: 'Paris',
    addressRegion: 'Île-de-France',
    postalCode: '75000',
    addressCountry: 'FR',
  },
  telephone: '+33123456789',
  email: 'contact@hairstylebypati.fr',
  priceRange: '€€',
  servesCity: 'Paris',
  openingHours: [
    { dayOfWeek: 'https://schema.org/Tuesday', opens: '10:00', closes: '19:00' },
    { dayOfWeek: 'https://schema.org/Wednesday', opens: '10:00', closes: '19:00' },
    { dayOfWeek: 'https://schema.org/Thursday', opens: '10:00', closes: '19:00' },
    { dayOfWeek: 'https://schema.org/Friday', opens: '10:00', closes: '19:00' },
    { dayOfWeek: 'https://schema.org/Saturday', opens: '10:00', closes: '19:00' },
  ],
};

/**
 * Génère le bloc JSON-LD LocalBusiness.
 * Le composant est un Server Component : le script est rendu statiquement dans le HTML.
 */
export default function LocalBusiness({ data }: { data: LocalBusinessData }) {
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'HealthAndBeautyBusiness',
    name: data.name,
    image:
      'https://images.pexels.com/photos/10825829/pexels-photo-10825829.jpeg?auto=compress&cs=tinysrgb&w=400',
    address: {
      '@type': 'PostalAddress',
      streetAddress: data.address.streetAddress,
      addressLocality: data.address.addressLocality,
      addressRegion: data.address.addressRegion,
      postalCode: data.address.postalCode,
      addressCountry: data.address.addressCountry,
    },
    telephone: data.telephone,
    email: data.email,
    priceRange: data.priceRange,
    servesCity: data.servesCity,
    openingHoursSpecification: data.openingHours.map((h) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: h.dayOfWeek,
      opens: h.opens,
      closes: h.closes,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

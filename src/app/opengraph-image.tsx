import { ImageResponse } from 'next/og';

export const alt = 'Hairstyle by Patricia, tresses, vanilles et locs sur mesure';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#fff8e9',
        padding: '64px 72px',
        color: '#191919',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
        <div
          style={{
            width: 18,
            height: 56,
            backgroundColor: '#f4c542',
            borderRadius: 8,
          }}
        />
        <div
          style={{ fontSize: 28, letterSpacing: 2, textTransform: 'uppercase', color: '#76513d' }}
        >
          Hairstyle by Patricia
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ fontSize: 74, lineHeight: 1.08, fontWeight: 700, maxWidth: 900 }}>
          Tresses, vanilles et locs sur mesure
        </div>
        <div style={{ fontSize: 30, color: '#4a4a4a' }}>
          Réservation en ligne · Paiement sur place · Paris
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '2px solid #f5ead0',
          paddingTop: 28,
          fontSize: 24,
          color: '#76513d',
        }}
      >
        <span>Coiffures protectrices et personnalisées</span>
        <span style={{ color: '#191919', fontWeight: 700 }}>Hairstyle by Patricia</span>
      </div>
    </div>,
    size,
  );
}

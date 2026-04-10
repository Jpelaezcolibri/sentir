import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'SENTIR — Cada producto, una experiencia';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #4AADA3 0%, #7EC8A0 50%, #8ED4CF 100%)',
          fontFamily: 'Georgia, serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Círculos decorativos de fondo */}
        <div style={{
          position: 'absolute', top: '-80px', right: '-80px',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)', display: 'flex',
        }} />
        <div style={{
          position: 'absolute', bottom: '-100px', left: '-60px',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)', display: 'flex',
        }} />

        {/* Nombre SENTIR */}
        <div style={{
          fontSize: '120px',
          fontWeight: '300',
          color: 'white',
          letterSpacing: '0.12em',
          lineHeight: 1,
          display: 'flex',
          textShadow: '0 4px 20px rgba(0,0,0,0.15)',
        }}>
          sentir
        </div>

        {/* Línea separadora */}
        <div style={{
          width: '80px', height: '2px',
          background: 'rgba(255,255,255,0.6)',
          margin: '28px 0',
          display: 'flex',
        }} />

        {/* Tagline */}
        <div style={{
          fontSize: '28px',
          color: 'rgba(255,255,255,0.9)',
          letterSpacing: '0.08em',
          fontWeight: '300',
          display: 'flex',
        }}>
          Cada producto, una experiencia
        </div>

        {/* WhatsApp badge */}
        <div style={{
          marginTop: '40px',
          padding: '12px 28px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50px',
          border: '1px solid rgba(255,255,255,0.4)',
          fontSize: '18px',
          color: 'white',
          letterSpacing: '0.05em',
          display: 'flex',
        }}>
          🛍️ Compra fácil por WhatsApp
        </div>
      </div>
    ),
    { ...size }
  );
}

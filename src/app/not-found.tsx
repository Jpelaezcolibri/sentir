import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-brown-dark text-xl mb-2">Página no encontrada</p>
        <p className="text-accent mb-8">La página que buscas no existe.</p>
        <Link href="/" className="bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary-dark transition">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

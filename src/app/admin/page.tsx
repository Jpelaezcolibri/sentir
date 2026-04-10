'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  FolderOpen,
  Image as ImageIcon,
  MessageSquare,
  Plus,
  Loader2,
  AlertTriangle,
  Trash2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
} from 'lucide-react';

interface BrokenImageDetail {
  imageId: string;
  productId: string;
  productName: string;
  storagePath: string;
  url: string;
  isPrimary: boolean;
  reason: string;
}

interface Stats {
  totalProducts: number;
  totalCollections: number;
  totalImages: number;
  brokenImages: number;
  brokenImagesList?: BrokenImageDetail[];
  totalTestimonials: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleaning, setCleaning] = useState(false);
  const [showBrokenList, setShowBrokenList] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        } else {
          setStats({
            totalProducts: 0,
            totalCollections: 0,
            totalImages: 0,
            brokenImages: 0,
            totalTestimonials: 0,
          });
        }
      } catch {
        setStats({
          totalProducts: 0,
          totalCollections: 0,
          totalImages: 0,
          brokenImages: 0,
          totalTestimonials: 0,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleCleanBrokenImages = async () => {
    if (!confirm('Esto eliminara registros de imagenes rotas (sin URL o con archivo inexistente en Storage). Ningun producto sera eliminado. Continuar?')) return;
    setCleaning(true);
    try {
      const res = await fetch('/api/admin/images/cleanup', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        alert(`Limpieza completada:\n- ${data.emptyUrl ?? 0} sin URL\n- ${data.orphanedFiles ?? 0} con archivo inexistente\n- Total eliminados: ${data.deleted}`);
        setShowBrokenList(false);
        // Refresh stats
        const statsRes = await fetch('/api/admin/stats');
        if (statsRes.ok) setStats(await statsRes.json());
      } else {
        alert('Error al limpiar imagenes rotas.');
      }
    } catch {
      alert('Error de conexion al limpiar imagenes.');
    } finally {
      setCleaning(false);
    }
  };

  const statCards = [
    {
      label: 'Total Productos',
      value: stats?.totalProducts ?? 0,
      icon: ShoppingBag,
      color: 'bg-primary/10 text-primary',
    },
    {
      label: 'Total Colecciones',
      value: stats?.totalCollections ?? 0,
      icon: FolderOpen,
      color: 'bg-secondary/10 text-secondary',
    },
    {
      label: 'Imagenes',
      value: stats?.totalImages ?? 0,
      icon: ImageIcon,
      color: 'bg-accent/10 text-accent',
    },
    {
      label: 'Testimonios',
      value: stats?.totalTestimonials ?? 0,
      icon: MessageSquare,
      color: 'bg-primary/10 text-primary',
    },
  ];

  const brokenList = stats?.brokenImagesList ?? [];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-brown-dark">
          Panel de Administracion SENTIR
        </h2>
        <p className="text-accent mt-1">
          Gestiona productos, colecciones y contenido de tu tienda.
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-accent">Verificando imagenes en Storage...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="bg-white rounded-xl border border-cream-dark p-5"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-accent">{card.label}</p>
                    <p className="text-3xl font-bold text-brown-dark mt-1">
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${card.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Broken Images Alert + List */}
      {stats && stats.brokenImages > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl overflow-hidden">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-yellow-800">
                  {stats.brokenImages} {stats.brokenImages === 1 ? 'imagen rota detectada' : 'imagenes rotas detectadas'}
                </p>
                <p className="text-xs text-yellow-600">
                  Registros con URL vacia o archivo inexistente en Storage.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setShowBrokenList(!showBrokenList)}
                className="inline-flex items-center gap-1 px-3 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition text-xs font-medium"
              >
                {showBrokenList ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {showBrokenList ? 'Ocultar' : 'Ver lista'}
              </button>
              <button
                onClick={handleCleanBrokenImages}
                disabled={cleaning}
                className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition text-xs font-medium disabled:opacity-50"
              >
                {cleaning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Limpiar todo
              </button>
            </div>
          </div>

          {/* Expandable List */}
          {showBrokenList && brokenList.length > 0 && (
            <div className="border-t border-yellow-200">
              <div className="max-h-80 overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-yellow-100 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2 text-yellow-800 font-semibold">Producto</th>
                      <th className="text-left px-4 py-2 text-yellow-800 font-semibold">Archivo</th>
                      <th className="text-center px-4 py-2 text-yellow-800 font-semibold">Primaria</th>
                      <th className="text-left px-4 py-2 text-yellow-800 font-semibold">Problema</th>
                      <th className="text-center px-4 py-2 text-yellow-800 font-semibold">Editar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brokenList.map((item, index) => (
                      <tr
                        key={item.imageId}
                        className={index % 2 === 0 ? 'bg-yellow-50/50' : 'bg-white/50'}
                      >
                        <td className="px-4 py-2 text-yellow-900 font-medium">
                          {item.productName}
                        </td>
                        <td className="px-4 py-2 text-yellow-700 truncate max-w-[200px]" title={item.storagePath}>
                          {item.storagePath || '(sin ruta)'}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {item.isPrimary ? (
                            <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px] font-bold">SI</span>
                          ) : (
                            <span className="text-yellow-500">no</span>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            item.reason === 'URL vacia'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {item.reason}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Link
                            href={`/admin/productos/${item.productId}/editar`}
                            className="inline-flex items-center text-yellow-700 hover:text-yellow-900"
                            title="Editar producto"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 bg-yellow-100 text-[10px] text-yellow-700 border-t border-yellow-200">
                Al limpiar se eliminan solo los registros de imagen rota. Los productos NO se eliminan. Si un producto tenia esta como primaria, se promueve la siguiente imagen valida.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-semibold text-brown-dark mb-3">
          Acciones Rapidas
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/productos/nuevo"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nuevo Producto
          </Link>
          <Link
            href="/admin/colecciones/nueva"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brown-dark text-white rounded-lg hover:bg-brown transition text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nueva Coleccion
          </Link>
        </div>
      </div>
    </div>
  );
}

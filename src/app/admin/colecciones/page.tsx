'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';

interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  product_count?: number;
}

export default function AdminColeccionesPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/collections');
      if (!res.ok) throw new Error('Error cargando colecciones');
      const data = await res.json();
      setCollections(data.collections || data || []);
    } catch {
      setError('No se pudieron cargar las colecciones.');
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminar la coleccion "${name}"? Los productos asociados quedaran sin coleccion.`))
      return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/collections/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error eliminando');
      setCollections((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Error al eliminar la coleccion.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-brown-dark">Colecciones</h2>
        <Link
          href="/admin/colecciones/nueva"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nueva Coleccion
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Collections Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : collections.length === 0 ? (
        <div className="text-center py-16 text-accent">
          <FolderOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No hay colecciones</p>
          <p className="text-sm mt-1">Crea tu primera coleccion para organizar los productos.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <div
              key={collection.id}
              className="bg-white rounded-xl border border-cream-dark p-5 hover:shadow-md transition group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {/* Icon & Color swatch */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                    style={{ backgroundColor: collection.color ? `${collection.color}20` : '#C4687A20' }}
                  >
                    {collection.icon || '📂'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-brown-dark">{collection.name}</h3>
                    <p className="text-xs text-accent">/{collection.slug}</p>
                  </div>
                </div>
                {/* Color swatch */}
                {collection.color && (
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-sm shrink-0"
                    style={{ backgroundColor: collection.color }}
                    title={collection.color}
                  />
                )}
              </div>

              {collection.description && (
                <p className="text-sm text-accent mb-3 line-clamp-2">
                  {collection.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-accent bg-cream-dark px-2 py-1 rounded-full">
                  {collection.product_count ?? 0} productos
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <Link
                    href={`/admin/colecciones/${collection.id}/editar`}
                    className="p-1.5 text-accent hover:text-primary transition rounded-lg hover:bg-primary/5"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(collection.id, collection.name)}
                    disabled={deletingId === collection.id}
                    className="p-1.5 text-accent hover:text-red-600 transition rounded-lg hover:bg-red-50 disabled:opacity-50"
                    title="Eliminar"
                  >
                    {deletingId === collection.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

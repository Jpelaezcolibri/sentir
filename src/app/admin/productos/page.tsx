'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  ShoppingBag,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  collection_id: string;
  collection_name?: string;
  is_active: boolean;
  images?: { id: string; url: string; is_primary: boolean }[];
}

interface Collection {
  id: string;
  name: string;
}

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterCollection, setFilterCollection] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterCollection) params.set('collection_id', filterCollection);
      const res = await fetch(`/api/admin/products?${params.toString()}`);
      if (!res.ok) throw new Error('Error cargando productos');
      const data = await res.json();
      setProducts(data.products || data || []);
    } catch {
      setError('No se pudieron cargar los productos.');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [search, filterCollection]);

  const fetchCollections = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/collections');
      if (res.ok) {
        const data = await res.json();
        setCollections(data.collections || data || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  useEffect(() => {
    const timeout = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timeout);
  }, [fetchProducts]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminar el producto "${name}"? Esta accion no se puede deshacer.`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error eliminando');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert('Error al eliminar el producto.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(price);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-brown-dark">Productos</h2>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Nuevo Producto
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-cream-dark rounded-lg bg-white text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
          />
        </div>
        <select
          value={filterCollection}
          onChange={(e) => setFilterCollection(e.target.value)}
          className="px-4 py-2.5 border border-cream-dark rounded-lg bg-white text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        >
          <option value="">Todas las colecciones</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-accent">
          <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No hay productos</p>
          <p className="text-sm mt-1">Crea tu primer producto para comenzar.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-cream-dark overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cream-dark bg-cream/50">
                  <th className="text-left px-4 py-3 font-medium text-accent">Imagen</th>
                  <th className="text-left px-4 py-3 font-medium text-accent">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-accent hidden md:table-cell">Coleccion</th>
                  <th className="text-left px-4 py-3 font-medium text-accent">Precio</th>
                  <th className="text-left px-4 py-3 font-medium text-accent hidden sm:table-cell">Estado</th>
                  <th className="text-right px-4 py-3 font-medium text-accent">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const primaryImage = product.images?.find((img) => img.is_primary) || product.images?.[0];
                  return (
                    <tr key={product.id} className="border-b border-cream-dark last:border-0 hover:bg-cream/30 transition">
                      <td className="px-4 py-3">
                        {primaryImage ? (
                          <img
                            src={primaryImage.url}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-cream-dark flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-accent/40" />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-brown-dark">{product.name}</td>
                      <td className="px-4 py-3 text-accent hidden md:table-cell">
                        {product.collection_name || '-'}
                      </td>
                      <td className="px-4 py-3 text-brown-dark">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            product.is_active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {product.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/productos/${product.id}/editar`}
                            className="p-1.5 text-accent hover:text-primary transition rounded-lg hover:bg-primary/5"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            disabled={deletingId === product.id}
                            className="p-1.5 text-accent hover:text-red-600 transition rounded-lg hover:bg-red-50 disabled:opacity-50"
                            title="Eliminar"
                          >
                            {deletingId === product.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

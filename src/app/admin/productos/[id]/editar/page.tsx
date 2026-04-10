'use client';

import { useState, useEffect, FormEvent, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import ImageUploader from '@/components/admin/ImageUploader';

interface Collection {
  id: string;
  name: string;
}

interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
  is_cover: boolean;
}

const SIZE_SCHEMES = [
  { label: 'XS, S, M, L, XL, XXL', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'S, M, L, XL', sizes: ['S', 'M', 'L', 'XL'] },
  { label: '(S,M), (L,XL)', sizes: ['(S,M)', '(L,XL)'] },
  { label: 'TALLA UNICA', sizes: ['TALLA UNICA'] },
  { label: 'KIDS (2,4), (6,8), (10,12), XS', sizes: ['(2,4)', '(6,8)', '(10,12)', 'XS'] },
];
const CATALOG_TYPES = ['bordado', 'estampado', 'personalizable', 'general'];

export default function AdminProductoEditarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<ProductImage[]>([]);

  const [form, setForm] = useState({
    name: '',
    price: '',
    collection_id: '',
    catalog_type: 'general',
    description: '',
    story: '',
    sizes: [] as string[],
    colors: '',
    tags: '',
    fabric: 'Tela fria algodon',
    isNew: false,
    isBordado: false,
    isPersonalizable: false,
    hasKidsVersion: false,
    isMetalizado: false,
    isDetallePerlas: false,
    isAltoRelieve: false,
    isPrecioLanzamiento: false,
    isEntregaInmediata: false,
    entregaInmediataSizes: [] as string[],
    entregaInmediataColors: '',
    isCuelloV: false,
    is_active: true,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [productRes, collectionsRes] = await Promise.all([
          fetch(`/api/admin/products/${id}`),
          fetch('/api/admin/collections'),
        ]);

        if (collectionsRes.ok) {
          const cData = await collectionsRes.json();
          setCollections(cData.collections || cData || []);
        }

        if (!productRes.ok) {
          setError('Producto no encontrado.');
          return;
        }

        const product = await productRes.json();
        const p = product.product || product;

        setForm({
          name: p.name || '',
          price: p.price?.toString() || '',
          collection_id: p.collection_id || '',
          catalog_type: p.catalog_type || 'general',
          description: p.description || '',
          story: p.story || '',
          sizes: p.sizes || [],
          colors: Array.isArray(p.colors) ? p.colors.join(', ') : p.colors || '',
          tags: Array.isArray(p.tags) ? p.tags.join(', ') : p.tags || '',
          fabric: p.fabric || 'Tela fria algodon',
          isNew: p.isNew ?? p.is_new ?? false,
          isBordado: p.isBordado ?? p.is_bordado ?? false,
          isPersonalizable: p.isPersonalizable ?? p.is_personalizable ?? false,
          hasKidsVersion: p.hasKidsVersion ?? p.has_kids_version ?? false,
          isMetalizado: p.isMetalizado ?? p.is_metalizado ?? false,
          isDetallePerlas: p.isDetallePerlas ?? p.is_detalle_perlas ?? false,
          isAltoRelieve: p.isAltoRelieve ?? p.is_alto_relieve ?? false,
          isPrecioLanzamiento: p.isPrecioLanzamiento ?? p.is_precio_lanzamiento ?? false,
          isEntregaInmediata: p.isEntregaInmediata ?? p.is_entrega_inmediata ?? false,
          entregaInmediataSizes: p.entregaInmediataSizes ?? p.entrega_inmediata_sizes ?? [],
          entregaInmediataColors: p.entregaInmediataColors ?? p.entrega_inmediata_colors ?? '',
          isCuelloV: p.isCuelloV ?? p.is_cuello_v ?? false,
          is_active: p.is_active ?? true,
        });

        setImages(p.product_images || []);
      } catch {
        setError('Error al cargar el producto.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const updateField = (field: string, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectSizeScheme = (sizes: string[]) => {
    setForm((prev) => ({ ...prev, sizes }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const body = {
        ...form,
        price: parseFloat(form.price) || 0,
        colors: form.colors
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      router.push('/admin/productos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Eliminar este producto? Esta accion no se puede deshacer.')) return;
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error eliminando');
      router.push('/admin/productos');
    } catch {
      alert('Error al eliminar el producto.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/productos"
            className="p-2 text-accent hover:text-primary transition rounded-lg hover:bg-primary/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl font-bold text-brown-dark">Editar Producto</h2>
        </div>
        <button
          onClick={handleDelete}
          className="inline-flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"
        >
          <Trash2 className="w-4 h-4" />
          Eliminar
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl border border-cream-dark p-6 space-y-4">
          <h3 className="text-lg font-semibold text-brown-dark">Informacion Basica</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-dark mb-1.5">
                Nombre del producto *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-dark mb-1.5">
                Precio (COP) *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => updateField('price', e.target.value)}
                required
                min="0"
                className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-dark mb-1.5">
                Coleccion
              </label>
              <select
                value={form.collection_id}
                onChange={(e) => updateField('collection_id', e.target.value)}
                className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              >
                <option value="">Sin coleccion</option>
                {collections.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-dark mb-1.5">
                Tipo de catalogo
              </label>
              <select
                value={form.catalog_type}
                onChange={(e) => updateField('catalog_type', e.target.value)}
                className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
              >
                {CATALOG_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-dark mb-1.5">
              Descripcion
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-dark mb-1.5">
              Historia / Story
            </label>
            <textarea
              value={form.story}
              onChange={(e) => updateField('story', e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm resize-none"
            />
          </div>
        </div>

        {/* Sizes & Colors */}
        <div className="bg-white rounded-xl border border-cream-dark p-6 space-y-4">
          <h3 className="text-lg font-semibold text-brown-dark">Tallas y Colores</h3>

          <div>
            <label className="block text-sm font-medium text-brown-dark mb-2">
              Esquema de tallas
            </label>
            <div className="flex flex-col gap-2">
              {SIZE_SCHEMES.map((scheme) => {
                const isSelected = JSON.stringify(form.sizes) === JSON.stringify(scheme.sizes);
                return (
                  <button
                    key={scheme.label}
                    type="button"
                    onClick={() => selectSizeScheme(scheme.sizes)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium border transition text-left ${
                      isSelected
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-brown-dark border-cream-dark hover:border-primary/50'
                    }`}
                  >
                    {scheme.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-dark mb-1.5">
              Colores (separados por coma)
            </label>
            <input
              type="text"
              value={form.colors}
              onChange={(e) => updateField('colors', e.target.value)}
              placeholder="Negro, Blanco, Rosa, Azul"
              className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-dark mb-1.5">
              Tags (separados por coma)
            </label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => updateField('tags', e.target.value)}
              placeholder="casual, verano, tendencia"
              className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-dark mb-1.5">
              Tela / Fabric
            </label>
            <input
              type="text"
              value={form.fabric}
              onChange={(e) => updateField('fabric', e.target.value)}
              className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="bg-white rounded-xl border border-cream-dark p-6 space-y-4">
          <h3 className="text-lg font-semibold text-brown-dark">Opciones</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'isNew', label: 'Producto nuevo' },
              { key: 'isPrecioLanzamiento', label: 'Precio de lanzamiento' },
              { key: 'isBordado', label: 'Es bordado' },
              { key: 'isPersonalizable', label: 'Es personalizable' },
              { key: 'hasKidsVersion', label: 'Tiene version kids' },
              { key: 'isMetalizado', label: 'Detalle metalizado' },
              { key: 'isDetallePerlas', label: 'Detalles perlas' },
              { key: 'isAltoRelieve', label: 'Alto relieve' },
              { key: 'isCuelloV', label: 'Cuello V' },
              { key: 'is_active', label: 'Producto activo' },
            ].map(({ key, label }) => (
              <label
                key={key}
                className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-cream/50 transition"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={form[key as keyof typeof form] as boolean}
                    onChange={(e) => updateField(key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-cream-dark rounded-full peer-checked:bg-primary transition" />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition" />
                </div>
                <span className="text-sm text-brown-dark">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Entrega Inmediata */}
        <div className="bg-white rounded-xl border border-emerald-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚡</span>
            <h3 className="text-lg font-semibold text-brown-dark">Entrega Inmediata</h3>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-emerald-50/50 transition">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.isEntregaInmediata}
                onChange={(e) => updateField('isEntregaInmediata', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-cream-dark rounded-full peer-checked:bg-emerald-500 transition" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow peer-checked:translate-x-4 transition" />
            </div>
            <span className="text-sm text-brown-dark font-medium">Disponible para entrega inmediata</span>
          </label>

          {form.isEntregaInmediata && (
            <div className="space-y-4 pl-2 border-l-2 border-emerald-200 ml-4">
              <div>
                <label className="block text-sm font-medium text-brown-dark mb-2">
                  Tallas con entrega inmediata
                </label>
                <div className="flex flex-wrap gap-2">
                  {(form.sizes.length > 0 ? form.sizes : SIZE_SCHEMES[0].sizes).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          entregaInmediataSizes: prev.entregaInmediataSizes.includes(size)
                            ? prev.entregaInmediataSizes.filter((s) => s !== size)
                            : [...prev.entregaInmediataSizes, size],
                        }));
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                        form.entregaInmediataSizes.includes(size)
                          ? 'bg-emerald-500 text-white border-emerald-500'
                          : 'bg-white text-brown-dark border-cream-dark hover:border-emerald-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {form.sizes.length === 0 && (
                  <p className="text-xs text-accent mt-1">Selecciona primero las tallas del producto arriba</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-brown-dark mb-1.5">
                  Colores con entrega inmediata
                </label>
                <input
                  type="text"
                  value={form.entregaInmediataColors}
                  onChange={(e) => updateField('entregaInmediataColors', e.target.value)}
                  placeholder="Negro, Blanco, Rosa palo"
                  className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-emerald-300/30 focus:border-emerald-400 transition text-sm"
                />
              </div>

              <p className="text-xs text-accent bg-emerald-50 p-3 rounded-lg">
                Solo productos ya confeccionados. Se envian el mismo dia si se pide antes de las 2:00 PM.
              </p>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl border border-cream-dark p-6 space-y-4">
          <h3 className="text-lg font-semibold text-brown-dark">Imagenes</h3>
          <ImageUploader
            productId={id}
            existingImages={images}
            onImagesChange={(newImages) => setImages(newImages)}
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
          <Link
            href="/admin/productos"
            className="px-6 py-2.5 text-accent hover:text-brown-dark transition text-sm font-medium"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

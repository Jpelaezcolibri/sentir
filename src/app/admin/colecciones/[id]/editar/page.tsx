'use client';

import { useState, useEffect, FormEvent, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, AlertCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function AdminColeccionEditarPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    short_description: '',
    story: '',
    icon: '',
    color: '#C4687A',
    color_light: '#F5D5DC',
    price_range: '',
  });

  useEffect(() => {
    async function loadCollection() {
      try {
        const res = await fetch(`/api/admin/collections/${id}`);
        if (!res.ok) {
          setError('Coleccion no encontrada.');
          return;
        }
        const data = await res.json();
        const c = data.collection || data;
        setForm({
          name: c.name || '',
          slug: c.slug || '',
          description: c.description || '',
          short_description: c.short_description || '',
          story: c.story || '',
          icon: c.icon || '',
          color: c.color || '#C4687A',
          color_light: c.color_light || '#F5D5DC',
          price_range: c.price_range || '',
        });
      } catch {
        setError('Error al cargar la coleccion.');
      } finally {
        setLoading(false);
      }
    }
    loadCollection();
  }, [id]);

  const updateField = (field: string, value: string) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'name' && prev.slug === slugify(prev.name)) {
        updated.slug = slugify(value);
      }
      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/collections/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      router.push('/admin/colecciones');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la coleccion.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Eliminar esta coleccion? Los productos asociados quedaran sin coleccion.'))
      return;
    try {
      const res = await fetch(`/api/admin/collections/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error eliminando');
      router.push('/admin/colecciones');
    } catch {
      alert('Error al eliminar la coleccion.');
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
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/colecciones"
            className="p-2 text-accent hover:text-primary transition rounded-lg hover:bg-primary/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-2xl font-bold text-brown-dark">Editar Coleccion</h2>
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
        <div className="bg-white rounded-xl border border-cream-dark p-6 space-y-4">
          <h3 className="text-lg font-semibold text-brown-dark">Informacion de la Coleccion</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-dark mb-1.5">
                Nombre *
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
                Slug
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
              />
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
              Descripcion corta
            </label>
            <input
              type="text"
              value={form.short_description}
              onChange={(e) => updateField('short_description', e.target.value)}
              className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
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

        {/* Appearance */}
        <div className="bg-white rounded-xl border border-cream-dark p-6 space-y-4">
          <h3 className="text-lg font-semibold text-brown-dark">Apariencia</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-dark mb-1.5">
                Icono (emoji o texto)
              </label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => updateField('icon', e.target.value)}
                placeholder="🦋"
                className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm text-center text-2xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-dark mb-1.5">
                Color principal
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => updateField('color', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-cream-dark cursor-pointer"
                />
                <input
                  type="text"
                  value={form.color}
                  onChange={(e) => updateField('color', e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-dark mb-1.5">
                Color claro
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color_light}
                  onChange={(e) => updateField('color_light', e.target.value)}
                  className="w-10 h-10 rounded-lg border border-cream-dark cursor-pointer"
                />
                <input
                  type="text"
                  value={form.color_light}
                  onChange={(e) => updateField('color_light', e.target.value)}
                  className="flex-1 px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-dark mb-1.5">
              Rango de precios
            </label>
            <input
              type="text"
              value={form.price_range}
              onChange={(e) => updateField('price_range', e.target.value)}
              placeholder="$45,000 - $65,000"
              className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
            />
          </div>

          {/* Preview */}
          <div className="mt-4 p-4 rounded-xl border border-cream-dark bg-cream/30">
            <p className="text-xs text-accent mb-2 font-medium">Vista previa</p>
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl"
                style={{ backgroundColor: form.color_light || '#F5D5DC' }}
              >
                {form.icon || '📂'}
              </div>
              <div>
                <p className="font-semibold text-brown-dark">{form.name || 'Nombre'}</p>
                <p className="text-xs text-accent">{form.short_description || 'Descripcion corta'}</p>
              </div>
            </div>
          </div>
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
            href="/admin/colecciones"
            className="px-6 py-2.5 text-accent hover:text-brown-dark transition text-sm font-medium"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}

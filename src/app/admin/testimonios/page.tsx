'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  MessageSquare,
  Star,
  Save,
  X,
} from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  city: string;
  text: string;
  rating: number;
  product: string;
}

const emptyTestimonial: Omit<Testimonial, 'id'> = {
  name: '',
  city: '',
  text: '',
  rating: 5,
  product: '',
};

export default function AdminTestimoniosPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Testimonial, 'id'>>(emptyTestimonial);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTestimonials = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/testimonials');
      if (!res.ok) throw new Error('Error cargando');
      const data = await res.json();
      setTestimonials(data.testimonials || data || []);
    } catch {
      setError('No se pudieron cargar los testimonios.');
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTestimonials();
  }, [fetchTestimonials]);

  const startEdit = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);
    setEditForm({
      name: testimonial.name,
      city: testimonial.city,
      text: testimonial.text,
      rating: testimonial.rating,
      product: testimonial.product,
    });
    setIsNew(false);
  };

  const startNew = () => {
    setEditingId('new');
    setEditForm({ ...emptyTestimonial });
    setIsNew(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsNew(false);
    setEditForm(emptyTestimonial);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const url = isNew ? '/api/admin/testimonials' : `/api/admin/testimonials/${editingId}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error('Error al guardar');

      await fetchTestimonials();
      cancelEdit();
    } catch {
      setError('Error al guardar el testimonio.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminar el testimonio de "${name}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error eliminando');
      setTestimonials((prev) => prev.filter((t) => t.id !== id));
    } catch {
      alert('Error al eliminar el testimonio.');
    } finally {
      setDeletingId(null);
    }
  };

  const renderStars = (rating: number, interactive = false) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setEditForm((prev) => ({ ...prev, rating: star }))}
          className={`${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            className={`w-4 h-4 ${
              star <= rating ? 'fill-gold text-gold' : 'text-cream-dark'
            }`}
          />
        </button>
      ))}
    </div>
  );

  const renderEditForm = () => (
    <div className="bg-white rounded-xl border-2 border-primary/30 p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={editForm.name}
          onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Nombre"
          className="px-3 py-2 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
        <input
          type="text"
          value={editForm.city}
          onChange={(e) => setEditForm((prev) => ({ ...prev, city: e.target.value }))}
          placeholder="Ciudad"
          className="px-3 py-2 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
      </div>
      <textarea
        value={editForm.text}
        onChange={(e) => setEditForm((prev) => ({ ...prev, text: e.target.value }))}
        placeholder="Texto del testimonio..."
        rows={3}
        className="w-full px-3 py-2 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none"
      />
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-accent">Rating:</span>
          {renderStars(editForm.rating, true)}
        </div>
        <input
          type="text"
          value={editForm.product}
          onChange={(e) => setEditForm((prev) => ({ ...prev, product: e.target.value }))}
          placeholder="Producto relacionado"
          className="flex-1 px-3 py-2 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
      </div>
      <div className="flex items-center gap-2 pt-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          {isNew ? 'Crear' : 'Guardar'}
        </button>
        <button
          onClick={cancelEdit}
          className="inline-flex items-center gap-2 px-4 py-2 text-accent hover:text-brown-dark transition text-sm"
        >
          <X className="w-3.5 h-3.5" />
          Cancelar
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold text-brown-dark">Testimonios</h2>
        <button
          onClick={startNew}
          disabled={editingId !== null}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium disabled:opacity-60"
        >
          <Plus className="w-4 h-4" />
          Nuevo Testimonio
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* New form at top */}
      {isNew && renderEditForm()}

      {/* Testimonials List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : testimonials.length === 0 && !isNew ? (
        <div className="text-center py-16 text-accent">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No hay testimonios</p>
          <p className="text-sm mt-1">Agrega testimonios de clientes satisfechas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((testimonial) =>
            editingId === testimonial.id ? (
              <div key={testimonial.id}>{renderEditForm()}</div>
            ) : (
              <div
                key={testimonial.id}
                className="bg-white rounded-xl border border-cream-dark p-5 hover:shadow-sm transition group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-brown-dark">{testimonial.name}</h4>
                      <span className="text-xs text-accent">{testimonial.city}</span>
                      {renderStars(testimonial.rating)}
                    </div>
                    <p className="text-sm text-accent/80 mb-2">&ldquo;{testimonial.text}&rdquo;</p>
                    {testimonial.product && (
                      <span className="text-xs bg-cream-dark text-accent px-2 py-0.5 rounded-full">
                        {testimonial.product}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button
                      onClick={() => startEdit(testimonial)}
                      disabled={editingId !== null}
                      className="p-1.5 text-accent hover:text-primary transition rounded-lg hover:bg-primary/5 disabled:opacity-50"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial.id, testimonial.name)}
                      disabled={deletingId === testimonial.id}
                      className="p-1.5 text-accent hover:text-red-600 transition rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === testimonial.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

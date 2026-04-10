'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Package,
  Save,
  X,
} from 'lucide-react';

interface Bundle {
  id: string;
  name: string;
  description: string;
  original_price: number;
  bundle_price: number;
  saving: number;
  items: string[];
  is_active: boolean;
}

const emptyBundle: Omit<Bundle, 'id'> = {
  name: '',
  description: '',
  original_price: 0,
  bundle_price: 0,
  saving: 0,
  items: [],
  is_active: true,
};

export default function AdminCombosPage() {
  const [combos, setCombos] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<Bundle, 'id'>>(emptyBundle);
  const [itemsText, setItemsText] = useState('');
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchCombos = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/bundles');
      if (!res.ok) throw new Error('Error cargando');
      const data = await res.json();
      setCombos(Array.isArray(data) ? data : data.bundles || []);
    } catch {
      setError('No se pudieron cargar los combos.');
      setCombos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCombos();
  }, [fetchCombos]);

  const startEdit = (combo: Bundle) => {
    setEditingId(combo.id);
    setEditForm({
      name: combo.name,
      description: combo.description,
      original_price: combo.original_price,
      bundle_price: combo.bundle_price,
      saving: combo.saving,
      items: combo.items,
      is_active: combo.is_active,
    });
    setItemsText(combo.items.join('\n'));
    setIsNew(false);
  };

  const startNew = () => {
    setEditingId('new');
    setEditForm({ ...emptyBundle });
    setItemsText('');
    setIsNew(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsNew(false);
    setEditForm(emptyBundle);
    setItemsText('');
  };

  const parseItems = (text: string): string[] => {
    return text
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const items = parseItems(itemsText);
      const bundle_price = editForm.bundle_price;
      const original_price = editForm.original_price;
      const savingAmount = original_price - bundle_price;

      const body = {
        name: editForm.name,
        description: editForm.description,
        original_price,
        bundle_price,
        saving: savingAmount > 0 ? savingAmount : 0,
        items,
        is_active: editForm.is_active,
      };

      const url = isNew ? '/api/admin/bundles' : `/api/admin/bundles/${editingId}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Error al guardar');

      await fetchCombos();
      cancelEdit();
    } catch {
      setError('Error al guardar el combo.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminar el combo "${name}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/bundles/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error eliminando');
      setCombos((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert('Error al eliminar el combo.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);

  const renderEditForm = () => (
    <div className="bg-white rounded-xl border-2 border-primary/30 p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          type="text"
          value={editForm.name}
          onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
          placeholder="Nombre del combo"
          className="px-3 py-2 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
        <input
          type="text"
          value={editForm.description}
          onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
          placeholder="Descripcion"
          className="px-3 py-2 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-accent mb-1">Precio original (COP)</label>
          <input
            type="number"
            value={editForm.original_price}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, original_price: parseFloat(e.target.value) || 0 }))
            }
            className="w-full px-3 py-2 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
        <div>
          <label className="block text-xs text-accent mb-1">Precio combo (COP)</label>
          <input
            type="number"
            value={editForm.bundle_price}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, bundle_price: parseFloat(e.target.value) || 0 }))
            }
            className="w-full px-3 py-2 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-accent mb-1">
          Items (uno por l&iacute;nea)
        </label>
        <textarea
          value={itemsText}
          onChange={(e) => setItemsText(e.target.value)}
          rows={4}
          placeholder={"Camiseta Mariposas\nCamiseta Flores\nCamiseta Tropical"}
          className="w-full px-3 py-2 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition resize-none font-mono"
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={editForm.is_active}
          onChange={(e) => setEditForm((prev) => ({ ...prev, is_active: e.target.checked }))}
          className="accent-primary"
        />
        <span className="text-sm text-brown-dark">Activo</span>
      </label>
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
        <h2 className="text-2xl font-bold text-brown-dark">Combos / Bundles</h2>
        <button
          onClick={startNew}
          disabled={editingId !== null}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium disabled:opacity-60"
        >
          <Plus className="w-4 h-4" />
          Nuevo Combo
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {isNew && renderEditForm()}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : combos.length === 0 && !isNew ? (
        <div className="text-center py-16 text-accent">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No hay combos</p>
          <p className="text-sm mt-1">Crea combos para ofrecer descuentos en paquetes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {combos.map((combo) =>
            editingId === combo.id ? (
              <div key={combo.id} className="sm:col-span-2 lg:col-span-3">
                {renderEditForm()}
              </div>
            ) : (
              <div
                key={combo.id}
                className="bg-white rounded-xl border border-cream-dark p-5 hover:shadow-md transition group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-brown-dark">{combo.name}</h3>
                    {combo.description && (
                      <p className="text-xs text-accent mt-0.5">{combo.description}</p>
                    )}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      combo.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {combo.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                {/* Prices */}
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-lg font-bold text-primary">{formatPrice(combo.bundle_price)}</span>
                  {combo.original_price > combo.bundle_price && (
                    <span className="text-sm text-accent line-through">
                      {formatPrice(combo.original_price)}
                    </span>
                  )}
                </div>
                {combo.saving > 0 && (
                  <p className="text-xs font-semibold text-[#25D366] mb-3">
                    Ahorras {formatPrice(combo.saving)}
                  </p>
                )}

                {/* Items */}
                {combo.items && combo.items.length > 0 && (
                  <ul className="space-y-1 mb-3">
                    {combo.items.map((item, i) => (
                      <li key={i} className="text-sm text-accent flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={() => startEdit(combo)}
                    disabled={editingId !== null}
                    className="p-1.5 text-accent hover:text-primary transition rounded-lg hover:bg-primary/5 disabled:opacity-50"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(combo.id, combo.name)}
                    disabled={deletingId === combo.id}
                    className="p-1.5 text-accent hover:text-red-600 transition rounded-lg hover:bg-red-50 disabled:opacity-50"
                  >
                    {deletingId === combo.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

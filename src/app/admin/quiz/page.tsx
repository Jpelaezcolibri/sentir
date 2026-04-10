'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Sparkles,
  Save,
  X,
  GripVertical,
} from 'lucide-react';

interface QuizOption {
  id: string;
  emoji: string;
  label: string;
  collection_id: string;
  collection_name?: string;
  sort_order: number;
}

interface Collection {
  id: string;
  name: string;
}

const emptyOption: Omit<QuizOption, 'id'> = {
  emoji: '',
  label: '',
  collection_id: '',
  collection_name: '',
  sort_order: 0,
};

export default function AdminQuizPage() {
  const [options, setOptions] = useState<QuizOption[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Omit<QuizOption, 'id'>>(emptyOption);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [optionsRes, collectionsRes] = await Promise.all([
        fetch('/api/admin/quiz-options'),
        fetch('/api/admin/collections'),
      ]);

      if (collectionsRes.ok) {
        const cData = await collectionsRes.json();
        setCollections(cData.collections || cData || []);
      }

      if (!optionsRes.ok) throw new Error('Error cargando');
      const data = await optionsRes.json();
      setOptions(data.options || data || []);
    } catch {
      setError('No se pudieron cargar las opciones del quiz.');
      setOptions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const startEdit = (option: QuizOption) => {
    setEditingId(option.id);
    setEditForm({
      emoji: option.emoji,
      label: option.label,
      collection_id: option.collection_id,
      collection_name: option.collection_name,
      sort_order: option.sort_order,
    });
    setIsNew(false);
  };

  const startNew = () => {
    setEditingId('new');
    setEditForm({ ...emptyOption, sort_order: options.length });
    setIsNew(true);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsNew(false);
    setEditForm(emptyOption);
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const url = isNew ? '/api/admin/quiz-options' : `/api/admin/quiz-options/${editingId}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!res.ok) throw new Error('Error al guardar');

      await fetchData();
      cancelEdit();
    } catch {
      setError('Error al guardar la opcion del quiz.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Eliminar la opcion "${label}" del quiz?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/quiz-options/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error eliminando');
      setOptions((prev) => prev.filter((o) => o.id !== id));
    } catch {
      alert('Error al eliminar la opcion.');
    } finally {
      setDeletingId(null);
    }
  };

  const getCollectionName = (collectionId: string) => {
    return collections.find((c) => c.id === collectionId)?.name || '-';
  };

  const renderEditForm = () => (
    <div className="bg-white rounded-xl border-2 border-primary/30 p-5 space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs text-accent mb-1">Emoji</label>
          <input
            type="text"
            value={editForm.emoji}
            onChange={(e) => setEditForm((prev) => ({ ...prev, emoji: e.target.value }))}
            placeholder="🦋"
            className="w-full px-3 py-2 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm text-center text-2xl focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-xs text-accent mb-1">Etiqueta</label>
          <input
            type="text"
            value={editForm.label}
            onChange={(e) => setEditForm((prev) => ({ ...prev, label: e.target.value }))}
            placeholder="Ej: Libre y soñadora"
            className="w-full px-3 py-2 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-accent mb-1">Coleccion vinculada</label>
          <select
            value={editForm.collection_id}
            onChange={(e) => setEditForm((prev) => ({ ...prev, collection_id: e.target.value }))}
            className="w-full px-3 py-2 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
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
          <label className="block text-xs text-accent mb-1">Orden</label>
          <input
            type="number"
            value={editForm.sort_order}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))
            }
            className="w-full px-3 py-2 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>
      </div>

      {/* Preview */}
      <div className="p-3 rounded-lg bg-cream/50 border border-cream-dark">
        <p className="text-xs text-accent mb-1">Vista previa:</p>
        <div className="inline-flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-cream-dark">
          <span className="text-2xl">{editForm.emoji || '?'}</span>
          <span className="text-sm font-medium text-brown-dark">{editForm.label || 'Etiqueta'}</span>
        </div>
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
        <div>
          <h2 className="text-2xl font-bold text-brown-dark">Quiz de Estilo</h2>
          <p className="text-sm text-accent mt-1">
            Gestiona las opciones que aparecen en el quiz &quot;Que estilo te define?&quot;
          </p>
        </div>
        <button
          onClick={startNew}
          disabled={editingId !== null}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium disabled:opacity-60"
        >
          <Plus className="w-4 h-4" />
          Nueva Opcion
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
      ) : options.length === 0 && !isNew ? (
        <div className="text-center py-16 text-accent">
          <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No hay opciones del quiz</p>
          <p className="text-sm mt-1">Agrega opciones para el quiz de personalidad.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {options
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((option) =>
              editingId === option.id ? (
                <div key={option.id}>{renderEditForm()}</div>
              ) : (
                <div
                  key={option.id}
                  className="bg-white rounded-xl border border-cream-dark p-4 hover:shadow-sm transition group flex items-center gap-4"
                >
                  <GripVertical className="w-4 h-4 text-cream-dark shrink-0" />
                  <span className="text-3xl shrink-0">{option.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-brown-dark">{option.label}</p>
                    <p className="text-xs text-accent">
                      Coleccion: {option.collection_name || getCollectionName(option.collection_id)}
                    </p>
                  </div>
                  <span className="text-xs text-accent bg-cream-dark px-2 py-1 rounded-full shrink-0">
                    #{option.sort_order}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition shrink-0">
                    <button
                      onClick={() => startEdit(option)}
                      disabled={editingId !== null}
                      className="p-1.5 text-accent hover:text-primary transition rounded-lg hover:bg-primary/5 disabled:opacity-50"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(option.id, option.label)}
                      disabled={deletingId === option.id}
                      className="p-1.5 text-accent hover:text-red-600 transition rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      {deletingId === option.id ? (
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

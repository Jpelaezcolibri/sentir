'use client';

import { useState, useEffect, useRef, useCallback, FormEvent, DragEvent, ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2, Save, AlertCircle, Upload, X, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Collection {
  id: string;
  name: string;
}

interface PreviewFile {
  file: File;
  preview: string;
}

const SIZE_SCHEMES = [
  { label: 'XS, S, M, L, XL, XXL', sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'] },
  { label: 'S, M, L, XL', sizes: ['S', 'M', 'L', 'XL'] },
  { label: '(S,M), (L,XL)', sizes: ['(S,M)', '(L,XL)'] },
  { label: 'TALLA UNICA', sizes: ['TALLA UNICA'] },
  { label: 'KIDS (2,4), (6,8), (10,12), XS', sizes: ['(2,4)', '(6,8)', '(10,12)', 'XS'] },
];
const CATALOG_TYPES = ['bordado', 'estampado', 'personalizable', 'general'];

export default function AdminProductoNuevoPage() {
  const router = useRouter();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState('');

  // Image state — select before saving
  const [pendingImages, setPendingImages] = useState<PreviewFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    entregaInmediataItems: [] as { imageIndex: number; size: string; color: string }[],
    isCuelloV: false,
    is_active: true,
  });

  useEffect(() => {
    async function loadCollections() {
      try {
        const res = await fetch('/api/admin/collections');
        if (res.ok) {
          const data = await res.json();
          setCollections(data.collections || data || []);
        }
      } catch {
        // ignore
      }
    }
    loadCollections();
  }, []);

  const updateField = (field: string, value: string | boolean | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const selectSizeScheme = (sizes: string[]) => {
    setForm((prev) => ({ ...prev, sizes }));
  };

  // ---- Image handling (local previews) ----
  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;
    const newPreviews = fileArray.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPendingImages((prev) => [...prev, ...newPreviews]);
  }, []);

  const handleDragOver = (e: DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };
  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) handleFiles(e.target.files);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const removePreview = (index: number) => {
    setPendingImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // ---- Submit: create product + upload images in one step ----
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    setProgress('Guardando producto...');

    try {
      // 1. Create product
      // Auto-generate backward-compat fields from items
      const eiItems = form.entregaInmediataItems.filter((it) => it.size && it.color);
      const body = {
        ...form,
        price: parseFloat(form.price) || 0,
        colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
        tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        entregaInmediataItems: eiItems,
        entregaInmediataSizes: [...new Set(eiItems.map((it) => it.size))],
        entregaInmediataColors: [...new Set(eiItems.map((it) => it.color))].join(', '),
      };

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar producto');
      }

      const productData = await res.json();
      const productId = productData.id;

      // 2. Upload images sequentially
      if (pendingImages.length > 0 && productId) {
        for (let i = 0; i < pendingImages.length; i++) {
          setProgress(`Subiendo imagen ${i + 1} de ${pendingImages.length}...`);
          const formData = new FormData();
          formData.append('file', pendingImages[i].file);
          formData.append('product_id', productId);

          const imgRes = await fetch('/api/admin/images/upload', {
            method: 'POST',
            body: formData,
          });

          if (!imgRes.ok) {
            console.error(`Error subiendo imagen ${i + 1}`);
          }
        }
      }

      setProgress('Listo! Redirigiendo...');
      pendingImages.forEach((p) => URL.revokeObjectURL(p.preview));
      router.push('/admin/productos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto.');
      setProgress('');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/productos"
          className="p-2 text-accent hover:text-primary transition rounded-lg hover:bg-primary/5"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-2xl font-bold text-brown-dark">Nuevo Producto</h2>
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
                placeholder="Ej: Camiseta Mariposas"
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
                placeholder="45000"
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
              placeholder="Describe el producto..."
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
              placeholder="La historia detras de este diseno..."
              className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm resize-none"
            />
          </div>
        </div>

        {/* Image Upload — select before saving */}
        <div className="bg-white rounded-xl border border-cream-dark p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-brown-dark">Imagenes</h3>
            <p className="text-xs text-accent mt-0.5">
              Selecciona las imagenes y se subiran automaticamente al guardar.
            </p>
          </div>

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
              isDragging
                ? 'border-primary bg-primary/5'
                : 'border-cream-dark hover:border-primary/50 hover:bg-cream/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload className={`w-8 h-8 mx-auto mb-2 ${isDragging ? 'text-primary' : 'text-accent/40'}`} />
            <p className="text-sm text-accent">
              {isDragging ? (
                <span className="text-primary font-medium">Suelta las imagenes aqui</span>
              ) : (
                <>
                  Arrastra imagenes aqui o{' '}
                  <span className="text-primary font-medium">haz clic para seleccionar</span>
                </>
              )}
            </p>
            <p className="text-xs text-accent/60 mt-1">PNG, JPG, WebP hasta 5MB</p>
          </div>

          {/* Previews */}
          {pendingImages.length > 0 && (
            <div>
              <p className="text-sm font-medium text-brown-dark mb-2">
                {pendingImages.length} {pendingImages.length === 1 ? 'imagen lista' : 'imagenes listas'} para subir
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {pendingImages.map((preview, index) => (
                  <div
                    key={index}
                    className="relative rounded-xl overflow-hidden border border-cream-dark aspect-square group"
                  >
                    <img
                      src={preview.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {index === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-amber-400 text-brown-dark text-[9px] font-bold px-2 py-0.5 rounded-full">
                        Principal
                      </span>
                    )}
                    {!saving && (
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removePreview(index); }}
                        className="absolute top-1.5 right-1.5 p-1 bg-black/60 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-500"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <p className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">
                      {preview.file.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                  Items disponibles para entrega inmediata
                </label>
                <p className="text-xs text-accent mb-3">
                  Cada item es una unidad especifica lista para enviar: foto + talla + color
                </p>

                {/* Items list */}
                <div className="space-y-3">
                  {form.entregaInmediataItems.map((item, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-emerald-100 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                          Item {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setForm((prev) => ({
                              ...prev,
                              entregaInmediataItems: prev.entregaInmediataItems.filter((_, i) => i !== idx),
                            }));
                          }}
                          className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Image selector */}
                      <div>
                        <label className="block text-xs font-medium text-accent mb-1.5">Foto</label>
                        {pendingImages.length > 0 ? (
                          <div className="flex gap-2 flex-wrap">
                            {pendingImages.map((img, imgIdx) => (
                              <button
                                key={imgIdx}
                                type="button"
                                onClick={() => {
                                  setForm((prev) => ({
                                    ...prev,
                                    entregaInmediataItems: prev.entregaInmediataItems.map((it, i) =>
                                      i === idx ? { ...it, imageIndex: imgIdx } : it
                                    ),
                                  }));
                                }}
                                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition ${
                                  item.imageIndex === imgIdx
                                    ? 'border-emerald-500 ring-2 ring-emerald-200'
                                    : 'border-cream-dark hover:border-emerald-300'
                                }`}
                              >
                                <img src={img.preview} alt={`Img ${imgIdx + 1}`} className="w-full h-full object-cover" />
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={item.imageIndex}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                setForm((prev) => ({
                                  ...prev,
                                  entregaInmediataItems: prev.entregaInmediataItems.map((it, i) =>
                                    i === idx ? { ...it, imageIndex: val } : it
                                  ),
                                }));
                              }}
                              className="w-20 px-3 py-2 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300/30"
                              placeholder="0"
                            />
                            <span className="text-xs text-accent">Indice de la foto (0 = primera)</span>
                          </div>
                        )}
                      </div>

                      {/* Size selector */}
                      <div>
                        <label className="block text-xs font-medium text-accent mb-1.5">Talla</label>
                        <div className="flex flex-wrap gap-1.5">
                          {(form.sizes.length > 0 ? form.sizes : SIZE_SCHEMES[0].sizes).map((size) => (
                            <button
                              key={size}
                              type="button"
                              onClick={() => {
                                setForm((prev) => ({
                                  ...prev,
                                  entregaInmediataItems: prev.entregaInmediataItems.map((it, i) =>
                                    i === idx ? { ...it, size } : it
                                  ),
                                }));
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                                item.size === size
                                  ? 'bg-emerald-500 text-white border-emerald-500'
                                  : 'bg-white text-brown-dark border-cream-dark hover:border-emerald-300'
                              }`}
                            >
                              {size}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Color input */}
                      <div>
                        <label className="block text-xs font-medium text-accent mb-1.5">Color</label>
                        <input
                          type="text"
                          value={item.color}
                          onChange={(e) => {
                            setForm((prev) => ({
                              ...prev,
                              entregaInmediataItems: prev.entregaInmediataItems.map((it, i) =>
                                i === idx ? { ...it, color: e.target.value } : it
                              ),
                            }));
                          }}
                          placeholder="Ej: Negro, Rosa palo"
                          className="w-full px-3 py-2 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-emerald-300/30 focus:border-emerald-400 transition text-sm"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add item button */}
                <button
                  type="button"
                  onClick={() => {
                    setForm((prev) => ({
                      ...prev,
                      entregaInmediataItems: [
                        ...prev.entregaInmediataItems,
                        { imageIndex: 0, size: '', color: '' },
                      ],
                    }));
                  }}
                  className="mt-3 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition"
                >
                  <Plus size={14} />
                  Agregar item
                </button>
              </div>

              <p className="text-xs text-accent bg-emerald-50 p-3 rounded-lg">
                Solo productos ya confeccionados. Se envian el mismo dia si se pide antes de las 2:00 PM.
              </p>
            </div>
          )}
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
                {progress}
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Producto{pendingImages.length > 0 ? ` + ${pendingImages.length} imagen${pendingImages.length > 1 ? 'es' : ''}` : ''}
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

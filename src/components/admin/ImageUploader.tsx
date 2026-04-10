'use client';

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import {
  Upload,
  X,
  Loader2,
  Image as ImageIcon,
  Star,
  Trash2,
  LayoutGrid,
} from 'lucide-react';

interface ProductImage {
  id: string;
  url: string;
  is_primary: boolean;
  is_cover: boolean;
}

interface ImageUploaderProps {
  productId: string;
  existingImages: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
}

interface PreviewFile {
  file: File;
  preview: string;
}

export default function ImageUploader({
  productId,
  existingImages,
  onImagesChange,
}: ImageUploaderProps) {
  const [previews, setPreviews] = useState<PreviewFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    const newPreviews = fileArray.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setPreviews((prev) => [...prev, ...newPreviews]);
    setError('');
  }, []);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      const removed = prev[index];
      URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadAll = async () => {
    if (previews.length === 0) return;
    setUploading(true);
    setError('');

    const uploaded: ProductImage[] = [];
    const newProgress: Record<string, number> = {};

    for (let i = 0; i < previews.length; i++) {
      const { file } = previews[i];
      const key = `file-${i}`;
      newProgress[key] = 0;
      setUploadProgress({ ...newProgress });

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('product_id', productId);

        const res = await fetch('/api/admin/images/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || `Error subiendo ${file.name}`);
        }

        const data = await res.json();
        const image = data.image || data;
        uploaded.push({
          id: image.id,
          url: image.url,
          is_primary: image.is_primary ?? false,
          is_cover: image.is_cover ?? false,
        });

        newProgress[key] = 100;
        setUploadProgress({ ...newProgress });
      } catch (err) {
        setError(err instanceof Error ? err.message : `Error subiendo ${file.name}`);
        newProgress[key] = -1;
        setUploadProgress({ ...newProgress });
      }
    }

    // Clean up previews for successfully uploaded files
    setPreviews([]);
    setUploadProgress({});
    setUploading(false);

    if (uploaded.length > 0) {
      const allImages = [...existingImages, ...uploaded];
      onImagesChange(allImages);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Eliminar esta imagen?')) return;
    setDeletingId(imageId);
    try {
      const res = await fetch(`/api/admin/images/${imageId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error eliminando imagen');
      const updated = existingImages.filter((img) => img.id !== imageId);
      onImagesChange(updated);
    } catch {
      alert('Error al eliminar la imagen.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const res = await fetch(`/api/admin/images/${imageId}/primary`, { method: 'PUT' });
      if (!res.ok) throw new Error('Error actualizando');
      const updated = existingImages.map((img) => ({
        ...img,
        is_primary: img.id === imageId,
      }));
      onImagesChange(updated);
    } catch {
      alert('Error al establecer imagen principal.');
    }
  };

  const handleToggleCover = async (imageId: string) => {
    try {
      const res = await fetch(`/api/admin/images/${imageId}/cover`, { method: 'PUT' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Error al cambiar portada.');
        return;
      }
      const data = await res.json();
      const updated = existingImages.map((img) =>
        img.id === imageId ? { ...img, is_cover: data.is_cover } : img
      );
      onImagesChange(updated);
    } catch {
      alert('Error al cambiar imagen de portada.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <p className="text-sm font-medium text-brown-dark mb-2">
            Imagenes actuales ({existingImages.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {existingImages.map((image) => (
              <div
                key={image.id}
                className="relative group rounded-xl overflow-hidden border border-cream-dark aspect-square"
              >
                <img
                  src={image.url}
                  alt="Product"
                  className="w-full h-full object-cover"
                />
                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {image.is_primary && (
                    <div className="bg-gold text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" />
                      Principal
                    </div>
                  )}
                  {image.is_cover && (
                    <div className="bg-primary text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <LayoutGrid className="w-3 h-3" />
                      Portada
                    </div>
                  )}
                </div>
                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                  {!image.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(image.id)}
                      className="p-2 bg-white rounded-lg text-gold hover:bg-gold hover:text-white transition"
                      title="Establecer como principal"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleToggleCover(image.id)}
                    className={`p-2 rounded-lg transition ${
                      image.is_cover
                        ? 'bg-primary text-white hover:bg-primary-dark'
                        : 'bg-white text-primary hover:bg-primary hover:text-white'
                    }`}
                    title={image.is_cover ? 'Quitar de portada' : 'Usar en portada de coleccion'}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    disabled={deletingId === image.id}
                    className="p-2 bg-white rounded-lg text-red-500 hover:bg-red-500 hover:text-white transition disabled:opacity-50"
                    title="Eliminar"
                  >
                    {deletingId === image.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
      {previews.length > 0 && (
        <div>
          <p className="text-sm font-medium text-brown-dark mb-2">
            Listas para subir ({previews.length})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative rounded-xl overflow-hidden border border-cream-dark aspect-square group"
              >
                <img
                  src={preview.preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Progress overlay */}
                {uploadProgress[`file-${index}`] !== undefined && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    {uploadProgress[`file-${index}`] === -1 ? (
                      <span className="text-red-400 text-xs font-medium">Error</span>
                    ) : uploadProgress[`file-${index}`] === 100 ? (
                      <span className="text-green-400 text-xs font-medium">Listo</span>
                    ) : (
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    )}
                  </div>
                )}
                {/* Remove button */}
                {!uploading && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removePreview(index);
                    }}
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

          {/* Upload button */}
          <button
            onClick={uploadAll}
            disabled={uploading}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" />
                Subir {previews.length} {previews.length === 1 ? 'imagen' : 'imagenes'}
              </>
            )}
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}

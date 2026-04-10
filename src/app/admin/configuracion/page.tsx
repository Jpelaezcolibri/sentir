'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Loader2, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface Settings {
  whatsapp_number: string;
  instagram_handle: string;
  tiktok_handle: string;
  instagram_url: string;
  tiktok_url: string;
  app_url: string;
}

const defaultSettings: Settings = {
  whatsapp_number: '',
  instagram_handle: '',
  tiktok_handle: '',
  instagram_url: '',
  tiktok_url: '',
  app_url: '',
};

export default function AdminConfiguracionPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setSettings({
            whatsapp_number: data.whatsapp_number || '',
            instagram_handle: data.instagram_handle || '',
            tiktok_handle: data.tiktok_handle || '',
            instagram_url: data.instagram_url || '',
            tiktok_url: data.tiktok_url || '',
            app_url: data.app_url || '',
          });
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const updateField = (field: keyof Settings, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setSuccess(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setSaving(true);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la configuracion.');
    } finally {
      setSaving(false);
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
      <div>
        <h2 className="text-2xl font-bold text-brown-dark">Configuracion</h2>
        <p className="text-sm text-accent mt-1">
          Datos generales de la tienda y redes sociales.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>Configuracion guardada exitosamente.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact */}
        <div className="bg-white rounded-xl border border-cream-dark p-6 space-y-4">
          <h3 className="text-lg font-semibold text-brown-dark">Contacto</h3>

          <div>
            <label className="block text-sm font-medium text-brown-dark mb-1.5">
              Numero de WhatsApp
            </label>
            <input
              type="text"
              value={settings.whatsapp_number}
              onChange={(e) => updateField('whatsapp_number', e.target.value)}
              placeholder="573001234567"
              className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
            />
            <p className="text-xs text-accent mt-1">
              Formato internacional sin + (ej: 573001234567)
            </p>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl border border-cream-dark p-6 space-y-4">
          <h3 className="text-lg font-semibold text-brown-dark">Redes Sociales</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-dark mb-1.5">
                Instagram Handle
              </label>
              <input
                type="text"
                value={settings.instagram_handle}
                onChange={(e) => updateField('instagram_handle', e.target.value)}
                placeholder="@sentirshop"
                className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-dark mb-1.5">
                Instagram URL
              </label>
              <input
                type="url"
                value={settings.instagram_url}
                onChange={(e) => updateField('instagram_url', e.target.value)}
                placeholder="https://instagram.com/sentirshop"
                className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-dark mb-1.5">
                TikTok Handle
              </label>
              <input
                type="text"
                value={settings.tiktok_handle}
                onChange={(e) => updateField('tiktok_handle', e.target.value)}
                placeholder="@sentirshop"
                className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-dark mb-1.5">
                TikTok URL
              </label>
              <input
                type="url"
                value={settings.tiktok_url}
                onChange={(e) => updateField('tiktok_url', e.target.value)}
                placeholder="https://tiktok.com/@sentirshop"
                className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
              />
            </div>
          </div>
        </div>

        {/* App */}
        <div className="bg-white rounded-xl border border-cream-dark p-6 space-y-4">
          <h3 className="text-lg font-semibold text-brown-dark">Aplicacion</h3>

          <div>
            <label className="block text-sm font-medium text-brown-dark mb-1.5">
              URL de la App
            </label>
            <input
              type="url"
              value={settings.app_url}
              onChange={(e) => updateField('app_url', e.target.value)}
              placeholder="https://sentir.shop"
              className="w-full px-4 py-2.5 border border-cream-dark rounded-lg bg-cream/30 text-brown-dark placeholder:text-accent/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition text-sm"
            />
          </div>
        </div>

        {/* Submit */}
        <div>
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
                Guardar Configuracion
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

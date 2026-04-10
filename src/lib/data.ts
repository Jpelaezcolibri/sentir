import { createClient } from '@/lib/supabase/server';
import type { Product, Collection, QuizOption, Testimonial, Bundle, SiteSettings, DbCollection, DbProductWithImages, DbQuizOption, DbTestimonial, DbBundle, DbSiteSetting } from '@/types';
import { transformCollection, transformProduct, transformQuizOption, transformTestimonial, transformBundle, transformSiteSettings } from '@/types';

export async function getCollectionsWithProducts(): Promise<Collection[]> {
  try {
    const supabase = await createClient();
    const { data: dbCollections, error: collectionsError } = await supabase
      .from('collections').select('*').eq('is_active', true).order('sort_order', { ascending: true });
    if (collectionsError || !dbCollections) { console.error('Error fetching collections:', collectionsError); return []; }

    const { data: dbProducts, error: productsError } = await supabase
      .from('products').select('*, product_images(*)').eq('is_active', true).order('sort_order', { ascending: true });
    if (productsError || !dbProducts) { console.error('Error fetching products:', productsError); return []; }

    const { data: appUrlSetting } = await supabase.from('site_settings').select('value').eq('key', 'app_url').single();
    const appUrl = appUrlSetting?.value || 'https://sentir.vercel.app';

    return (dbCollections as DbCollection[]).map((dbCol) => {
      const collectionProducts = (dbProducts as DbProductWithImages[])
        .filter((p) => p.collection_id === dbCol.id)
        .map((p) => transformProduct(p, appUrl));
      return transformCollection(dbCol, collectionProducts);
    });
  } catch (error) { console.error('Error in getCollectionsWithProducts:', error); return []; }
}

export async function getEntregaInmediataProducts(): Promise<Product[]> {
  try {
    const supabase = await createClient();
    const { data: dbProducts, error } = await supabase
      .from('products').select('*, product_images(*)').eq('is_active', true).eq('is_entrega_inmediata', true).order('sort_order', { ascending: true });
    if (error || !dbProducts) { console.error('Error fetching entrega inmediata:', error); return []; }
    const { data: appUrlSetting } = await supabase.from('site_settings').select('value').eq('key', 'app_url').single();
    const appUrl = appUrlSetting?.value || 'https://sentir.vercel.app';
    return (dbProducts as DbProductWithImages[]).map((p) => transformProduct(p, appUrl));
  } catch (error) { console.error('Error in getEntregaInmediataProducts:', error); return []; }
}

export async function getQuizOptions(): Promise<QuizOption[]> {
  try {
    const supabase = await createClient();
    const { data: dbOptions, error } = await supabase.from('quiz_options').select('*').order('sort_order', { ascending: true });
    if (error || !dbOptions) { console.error('Error fetching quiz options:', error); return []; }
    return (dbOptions as DbQuizOption[]).map(transformQuizOption);
  } catch (error) { console.error('Error in getQuizOptions:', error); return []; }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const supabase = await createClient();
    const { data: dbTestimonials, error } = await supabase.from('testimonials').select('*').order('sort_order', { ascending: true });
    if (error || !dbTestimonials) { console.error('Error fetching testimonials:', error); return []; }
    return (dbTestimonials as DbTestimonial[]).map(transformTestimonial).map((t) => ({
      ...t,
      text: t.text.replace(/lilika/gi, 'SENTIR'),
      product: t.product.replace(/lilika/gi, 'SENTIR'),
    }));
  } catch (error) { console.error('Error in getTestimonials:', error); return []; }
}

export async function getBundles(): Promise<Bundle[]> {
  try {
    const supabase = await createClient();
    const { data: dbBundles, error } = await supabase.from('bundles').select('*').order('sort_order', { ascending: true });
    if (error || !dbBundles) { console.error('Error fetching bundles:', error); return []; }
    return (dbBundles as DbBundle[]).map(transformBundle);
  } catch (error) { console.error('Error in getBundles:', error); return []; }
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const defaults: SiteSettings = { whatsapp_number: '', instagram_handle: '', tiktok_handle: '', instagram_url: '', tiktok_url: '', app_url: 'https://sentir.vercel.app' };
  try {
    const supabase = await createClient();
    const { data: dbSettings, error } = await supabase.from('site_settings').select('*');
    if (error || !dbSettings) { console.error('Error fetching site settings:', error); return defaults; }
    const settings = transformSiteSettings(dbSettings as DbSiteSetting[]);
    // Redes sociales de SENTIR
    settings.instagram_handle = 'Sentir_estilo';
    settings.tiktok_handle = 'Sentir_estilo';
    if (!settings.instagram_url) settings.instagram_url = 'https://instagram.com/Sentir_estilo';
    if (!settings.tiktok_url) settings.tiktok_url = 'https://tiktok.com/@Sentir_estilo';
    return settings;
  } catch (error) { console.error('Error in getSiteSettings:', error); return defaults; }
}

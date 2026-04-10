// ============================================
// SENTIR — TypeScript Type Definitions
// ============================================

export interface EntregaInmediataItem {
  imageIndex: number;
  size: string;
  color: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images: string[];
  coverImage?: string;
  sizes: string[];
  colors: string;
  fabric: string;
  story: string;
  tags: string[];
  catalog: string;
  pageNumber: number;
  shareUrl: string;
  hasKidsVersion?: boolean;
  isNew?: boolean;
  isBordado?: boolean;
  isPersonalizable?: boolean;
  isMetalizado?: boolean;
  isDetallePerlas?: boolean;
  isAltoRelieve?: boolean;
  isPrecioLanzamiento?: boolean;
  isEntregaInmediata?: boolean;
  isCuelloV?: boolean;
  entregaInmediataSizes?: string[];
  entregaInmediataColors?: string;
  entregaInmediataItems?: EntregaInmediataItem[];
  wholesaleDiscount?: number | null;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  story: string;
  icon: string;
  color: string;
  colorLight: string;
  priceRange: string;
  products: Product[];
}

export interface QuizOption {
  id: string;
  label: string;
  emoji: string;
  collectionId: string;
}

export interface Testimonial {
  name: string;
  city: string;
  text: string;
  rating: number;
  product: string;
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  originalPrice: number;
  bundlePrice: number;
  saving: number;
  items: string[];
}

export interface SiteSettings {
  whatsapp_number: string;
  instagram_handle: string;
  tiktok_handle: string;
  instagram_url: string;
  tiktok_url: string;
  app_url: string;
  [key: string]: string;
}

// ============================================
// Database Row Types (snake_case from Supabase)
// ============================================

export interface DbCollection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  story: string | null;
  icon: string | null;
  color: string | null;
  color_light: string | null;
  price_range: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbProduct {
  id: string;
  collection_id: string | null;
  name: string;
  price: number;
  sizes: string[];
  colors: string | null;
  fabric: string;
  story: string | null;
  tags: string[];
  catalog: string;
  page_number: number | null;
  has_kids_version: boolean;
  is_new: boolean;
  is_bordado: boolean;
  is_personalizable: boolean;
  is_metalizado: boolean;
  is_detalle_perlas: boolean;
  is_alto_relieve: boolean;
  is_precio_lanzamiento: boolean;
  is_entrega_inmediata: boolean;
  entrega_inmediata_sizes: string[];
  entrega_inmediata_colors: string | null;
  entrega_inmediata_items: EntregaInmediataItem[] | null;
  is_cuello_v: boolean;
  is_active: boolean;
  sort_order: number;
  wholesale_discount: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbProductImage {
  id: string;
  product_id: string;
  storage_path: string;
  url: string;
  is_primary: boolean;
  is_cover: boolean;
  sort_order: number;
  created_at: string;
}

export interface DbQuizOption {
  id: string;
  label: string;
  emoji: string | null;
  collection_id: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface DbTestimonial {
  id: string;
  name: string;
  city: string | null;
  text: string;
  rating: number;
  product: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface DbBundle {
  id: string;
  name: string;
  description: string | null;
  original_price: number;
  bundle_price: number;
  saving: number;
  items: string[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbSiteSetting {
  key: string;
  value: string | null;
  updated_at: string;
}

export interface DbProductWithImages extends DbProduct {
  product_images: DbProductImage[];
}

// ============================================
// Transformers: DB -> Frontend
// ============================================

export function transformCollection(dbCollection: DbCollection, products: Product[] = []): Collection {
  return {
    id: dbCollection.id,
    name: dbCollection.name,
    slug: dbCollection.slug,
    description: dbCollection.description ?? '',
    shortDescription: dbCollection.short_description ?? '',
    story: dbCollection.story ?? '',
    icon: dbCollection.icon ?? '',
    color: dbCollection.color ?? '',
    colorLight: dbCollection.color_light ?? '',
    priceRange: dbCollection.price_range ?? '',
    products,
  };
}

function isValidImageUrl(url: string): boolean {
  if (!url || url.trim() === '') return false;
  try {
    const parsed = new URL(url, 'https://placeholder.local');
    if (url.startsWith('/')) return true;
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch { return false; }
}

function cleanJsonString(value: string | null | string[]): string {
  if (Array.isArray(value)) {
    const cleaned = value.map((v) => cleanJsonString(v)).filter(Boolean);
    return cleaned.join(', ');
  }
  if (!value) return '';
  let s = value.trim();
  for (let i = 0; i < 10; i++) {
    const prev = s;
    if (s.startsWith('"') && s.endsWith('"')) {
      try { const p = JSON.parse(s); if (typeof p === 'string') { s = p.trim(); continue; } } catch { /* */ }
    }
    if (s.startsWith('[') && s.endsWith(']')) {
      try {
        const p = JSON.parse(s);
        if (Array.isArray(p)) {
          if (p.length === 0) return '';
          const cleaned = p.map((x) => typeof x === 'string' ? cleanJsonString(x) : '').filter(Boolean);
          return cleaned.join(', ');
        }
      } catch { /* */ }
    }
    if (s === prev) break;
  }
  s = s.replace(/\\/g, '').replace(/^\[+/, '').replace(/\]+$/, '')
       .replace(/^"+|"+$/g, '').replace(/","/g, ', ').replace(/"+/g, '');
  return s.trim();
}

export function transformProduct(dbProduct: DbProductWithImages, appUrl: string = 'https://sentir.vercel.app'): Product {
  const sortedImages = [...dbProduct.product_images]
    .sort((a, b) => a.sort_order - b.sort_order)
    .filter((img) => isValidImageUrl(img.url));
  const primaryImage = sortedImages.find((img) => img.is_primary) ?? sortedImages[0];
  const coverImage = sortedImages.find((img) => img.is_cover);

  return {
    id: dbProduct.id,
    name: dbProduct.name,
    price: dbProduct.price,
    image: primaryImage?.url ?? '/placeholder-product.svg',
    images: sortedImages.length > 0 ? sortedImages.map((img) => img.url) : ['/placeholder-product.svg'],
    coverImage: coverImage?.url,
    sizes: dbProduct.sizes ?? [],
    colors: cleanJsonString(dbProduct.colors),
    fabric: dbProduct.fabric,
    story: dbProduct.story ?? '',
    tags: dbProduct.tags ?? [],
    catalog: dbProduct.catalog,
    pageNumber: dbProduct.page_number ?? 0,
    shareUrl: `${appUrl}/producto/${dbProduct.id}`,
    hasKidsVersion: dbProduct.has_kids_version,
    isNew: dbProduct.is_new,
    isBordado: dbProduct.is_bordado,
    isPersonalizable: dbProduct.is_personalizable,
    isMetalizado: dbProduct.is_metalizado,
    isDetallePerlas: dbProduct.is_detalle_perlas,
    isAltoRelieve: dbProduct.is_alto_relieve,
    isPrecioLanzamiento: dbProduct.is_precio_lanzamiento,
    isEntregaInmediata: dbProduct.is_entrega_inmediata,
    entregaInmediataSizes: dbProduct.entrega_inmediata_sizes ?? [],
    entregaInmediataColors: dbProduct.entrega_inmediata_colors ?? '',
    entregaInmediataItems: dbProduct.entrega_inmediata_items ?? [],
    isCuelloV: dbProduct.is_cuello_v,
    wholesaleDiscount: dbProduct.wholesale_discount ?? null,
  };
}

export function transformQuizOption(dbOption: DbQuizOption): QuizOption {
  return { id: dbOption.id, label: dbOption.label, emoji: dbOption.emoji ?? '', collectionId: dbOption.collection_id ?? '' };
}

export function transformTestimonial(dbTestimonial: DbTestimonial): Testimonial {
  return { name: dbTestimonial.name, city: dbTestimonial.city ?? '', text: dbTestimonial.text, rating: dbTestimonial.rating, product: dbTestimonial.product ?? '' };
}

export function transformBundle(dbBundle: DbBundle): Bundle {
  return { id: dbBundle.id, name: dbBundle.name, description: dbBundle.description ?? '', originalPrice: dbBundle.original_price, bundlePrice: dbBundle.bundle_price, saving: dbBundle.saving, items: dbBundle.items ?? [] };
}

export function transformSiteSettings(dbSettings: DbSiteSetting[]): SiteSettings {
  const settings: SiteSettings = { whatsapp_number: '', instagram_handle: '', tiktok_handle: '', instagram_url: '', tiktok_url: '', app_url: '' };
  for (const setting of dbSettings) { settings[setting.key] = setting.value ?? ''; }
  return settings;
}

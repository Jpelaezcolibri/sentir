import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9\s-]/g, '')    // remove special characters
    .replace(/\s+/g, '-')            // replace spaces with hyphens
    .replace(/-+/g, '-')             // collapse multiple hyphens
    .replace(/^-|-$/g, '');          // trim hyphens from edges

  const suffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${suffix}`;
}

// GET /api/admin/products - Fetch all products with images and collection name
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get('collection_id');
    const search = searchParams.get('search');

    let query = supabase
      .from('products')
      .select(`
        *,
        collections ( id, name ),
        product_images ( id, url, storage_path, is_primary, sort_order )
      `)
      .order('sort_order', { ascending: true });

    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Flatten the collection name for convenience
    const products = data?.map((p) => ({
      ...p,
      collection_name: p.collections?.name || null,
      collections: undefined,
    }));

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    // Auto-generate id from name if not provided
    const id = body.id || (body.name ? slugify(body.name) : undefined);

    // Ensure array fields
    const colors = typeof body.colors === 'string'
      ? body.colors.split(',').map((c: string) => c.trim()).filter(Boolean)
      : body.colors || [];
    const tags = typeof body.tags === 'string'
      ? body.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
      : body.tags || [];

    // Map form field names to DB column names (same pattern as PUT)
    const insertData: Record<string, unknown> = {
      id,
      name: body.name,
      price: parseFloat(body.price) || 0,
      colors,
      tags,
    };

    // Direct fields
    if (body.collection_id) insertData.collection_id = body.collection_id;
    if (body.description !== undefined) insertData.description = body.description;
    if (body.story !== undefined) insertData.story = body.story;
    if (body.fabric !== undefined) insertData.fabric = body.fabric;
    if (body.sizes !== undefined) insertData.sizes = body.sizes;
    if (body.page_number !== undefined) insertData.page_number = body.page_number;
    if (body.sort_order !== undefined) insertData.sort_order = body.sort_order;
    if (body.is_active !== undefined) insertData.is_active = body.is_active;

    // Map catalog_type -> catalog
    if (body.catalog_type !== undefined) insertData.catalog = body.catalog_type;
    if (body.catalog !== undefined) insertData.catalog = body.catalog;

    // Map camelCase -> snake_case
    if ('isNew' in body) insertData.is_new = body.isNew;
    if ('isBordado' in body) insertData.is_bordado = body.isBordado;
    if ('isPersonalizable' in body) insertData.is_personalizable = body.isPersonalizable;
    if ('hasKidsVersion' in body) insertData.has_kids_version = body.hasKidsVersion;
    if ('isMetalizado' in body) insertData.is_metalizado = body.isMetalizado;
    if ('isDetallePerlas' in body) insertData.is_detalle_perlas = body.isDetallePerlas;
    if ('isAltoRelieve' in body) insertData.is_alto_relieve = body.isAltoRelieve;
    if ('isPrecioLanzamiento' in body) insertData.is_precio_lanzamiento = body.isPrecioLanzamiento;
    if ('isEntregaInmediata' in body) insertData.is_entrega_inmediata = body.isEntregaInmediata;
    if ('entregaInmediataSizes' in body) insertData.entrega_inmediata_sizes = body.entregaInmediataSizes;
    if ('entregaInmediataColors' in body) insertData.entrega_inmediata_colors = body.entregaInmediataColors;
    if ('entregaInmediataItems' in body) insertData.entrega_inmediata_items = body.entregaInmediataItems;
    if ('isCuelloV' in body) insertData.is_cuello_v = body.isCuelloV;

    // Also accept snake_case directly
    if ('is_new' in body) insertData.is_new = body.is_new;
    if ('is_bordado' in body) insertData.is_bordado = body.is_bordado;
    if ('is_personalizable' in body) insertData.is_personalizable = body.is_personalizable;
    if ('has_kids_version' in body) insertData.has_kids_version = body.has_kids_version;
    if ('is_metalizado' in body) insertData.is_metalizado = body.is_metalizado;
    if ('is_detalle_perlas' in body) insertData.is_detalle_perlas = body.is_detalle_perlas;
    if ('is_alto_relieve' in body) insertData.is_alto_relieve = body.is_alto_relieve;
    if ('is_precio_lanzamiento' in body) insertData.is_precio_lanzamiento = body.is_precio_lanzamiento;
    if ('is_entrega_inmediata' in body) insertData.is_entrega_inmediata = body.is_entrega_inmediata;
    if ('entrega_inmediata_sizes' in body) insertData.entrega_inmediata_sizes = body.entrega_inmediata_sizes;
    if ('entrega_inmediata_colors' in body) insertData.entrega_inmediata_colors = body.entrega_inmediata_colors;
    if ('entrega_inmediata_items' in body) insertData.entrega_inmediata_items = body.entrega_inmediata_items;
    if ('is_cuello_v' in body) insertData.is_cuello_v = body.is_cuello_v;

    const { data, error } = await supabase
      .from('products')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidatePath('/');

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

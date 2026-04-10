import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createAdminClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/admin/products/[id] - Fetch single product with images and collection
export async function GET(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        collections ( id, name, slug ),
        product_images ( id, url, storage_path, is_primary, is_cover, sort_order )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Sort images by sort_order
    if (data.product_images) {
      data.product_images.sort((a: { sort_order: number }, b: { sort_order: number }) =>
        (a.sort_order || 0) - (b.sort_order || 0)
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/[id] - Update product
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = createAdminClient();
    const body = await request.json();

    // Ensure array fields stay as arrays for TEXT[] columns
    if (typeof body.colors === 'string') body.colors = body.colors.split(',').map((c: string) => c.trim()).filter(Boolean);
    if (typeof body.tags === 'string') body.tags = body.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
    // Convertir string vacío a null en collection_id para respetar la foreign key constraint
    if ('collection_id' in body && body.collection_id === '') body.collection_id = null;

    // Map form field names to actual DB column names
    const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const directFields = ['name', 'price', 'collection_id', 'story', 'sizes', 'colors', 'tags', 'fabric', 'is_active', 'sort_order', 'catalog', 'catalog_type', 'page_number', 'wholesale_discount'];
    for (const key of directFields) {
      if (key in body) updateData[key] = body[key];
    }
    // Map camelCase form names to snake_case DB columns
    if ('isNew' in body) updateData.is_new = body.isNew;
    if ('isBordado' in body) updateData.is_bordado = body.isBordado;
    if ('isPersonalizable' in body) updateData.is_personalizable = body.isPersonalizable;
    if ('hasKidsVersion' in body) updateData.has_kids_version = body.hasKidsVersion;
    if ('isMetalizado' in body) updateData.is_metalizado = body.isMetalizado;
    if ('isDetallePerlas' in body) updateData.is_detalle_perlas = body.isDetallePerlas;
    if ('isAltoRelieve' in body) updateData.is_alto_relieve = body.isAltoRelieve;
    if ('isPrecioLanzamiento' in body) updateData.is_precio_lanzamiento = body.isPrecioLanzamiento;
    if ('isEntregaInmediata' in body) updateData.is_entrega_inmediata = body.isEntregaInmediata;
    if ('entregaInmediataSizes' in body) {
      updateData.entrega_inmediata_sizes = body.entregaInmediataSizes;
      // Si se guarda via el form legacy (sizes array), limpiar entrega_inmediata_items
      // para evitar que datos viejos anulen la configuración nueva
      if (!('entregaInmediataItems' in body)) {
        updateData.entrega_inmediata_items = [];
      }
    }
    if ('entregaInmediataColors' in body) updateData.entrega_inmediata_colors = body.entregaInmediataColors;
    if ('entregaInmediataItems' in body) updateData.entrega_inmediata_items = body.entregaInmediataItems;
    if ('isCuelloV' in body) updateData.is_cuello_v = body.isCuelloV;
    // Also accept snake_case directly
    if ('is_new' in body) updateData.is_new = body.is_new;
    if ('is_bordado' in body) updateData.is_bordado = body.is_bordado;
    if ('is_personalizable' in body) updateData.is_personalizable = body.is_personalizable;
    if ('has_kids_version' in body) updateData.has_kids_version = body.has_kids_version;
    if ('is_metalizado' in body) updateData.is_metalizado = body.is_metalizado;
    if ('is_detalle_perlas' in body) updateData.is_detalle_perlas = body.is_detalle_perlas;
    if ('is_alto_relieve' in body) updateData.is_alto_relieve = body.is_alto_relieve;
    if ('is_precio_lanzamiento' in body) updateData.is_precio_lanzamiento = body.is_precio_lanzamiento;
    if ('is_entrega_inmediata' in body) updateData.is_entrega_inmediata = body.is_entrega_inmediata;
    if ('entrega_inmediata_sizes' in body) {
      updateData.entrega_inmediata_sizes = body.entrega_inmediata_sizes;
      if (!('entrega_inmediata_items' in body) && !('entregaInmediataItems' in body)) {
        updateData.entrega_inmediata_items = [];
      }
    }
    if ('entrega_inmediata_colors' in body) updateData.entrega_inmediata_colors = body.entrega_inmediata_colors;
    if ('entrega_inmediata_items' in body) updateData.entrega_inmediata_items = body.entrega_inmediata_items;
    if ('is_cuello_v' in body) updateData.is_cuello_v = body.is_cuello_v;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidatePath('/');
    revalidatePath(`/producto/${id}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/[id] - Soft delete (set is_active = false)
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('products')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    revalidatePath('/');
    revalidatePath(`/producto/${id}`);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

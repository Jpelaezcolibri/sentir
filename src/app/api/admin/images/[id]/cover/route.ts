import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/admin/images/[id]/cover - Toggle is_cover for an image
// Each collection can have up to 4 cover images (across all its products).
export async function PUT(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = createAdminClient();

    // Get the image to find its product_id and current is_cover state
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('id, product_id, is_cover')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const newCoverState = !image.is_cover;

    // If enabling cover, check the limit of 4 per collection
    if (newCoverState) {
      // Get the collection_id for this product
      const { data: product } = await supabase
        .from('products')
        .select('collection_id')
        .eq('id', image.product_id)
        .single();

      if (product?.collection_id) {
        // Count existing cover images in this collection
        const { data: coverImages } = await supabase
          .from('product_images')
          .select('id, product_id')
          .eq('is_cover', true)
          .neq('id', id);

        // Filter to only images belonging to products in this collection
        if (coverImages) {
          const { data: collectionProducts } = await supabase
            .from('products')
            .select('id')
            .eq('collection_id', product.collection_id);

          const collectionProductIds = new Set(
            (collectionProducts ?? []).map((p) => p.id)
          );

          const collectionCoverCount = coverImages.filter(
            (img) => collectionProductIds.has(img.product_id)
          ).length;

          if (collectionCoverCount >= 4) {
            return NextResponse.json(
              { error: 'Esta coleccion ya tiene 4 imagenes de portada. Quita una antes de agregar otra.' },
              { status: 400 }
            );
          }
        }
      }
    }

    // Toggle is_cover
    const { data, error } = await supabase
      .from('product_images')
      .update({ is_cover: newCoverState })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error toggling cover image:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

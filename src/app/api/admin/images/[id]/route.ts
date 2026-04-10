import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/admin/images/[id] - Update image (is_primary, sort_order)
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = createAdminClient();
    const body = await request.json();

    // If setting is_primary = true, unset all other images for the same product first
    if (body.is_primary === true) {
      // Get the current image to find its product_id
      const { data: currentImage, error: fetchError } = await supabase
        .from('product_images')
        .select('product_id')
        .eq('id', id)
        .single();

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 });
        }
        return NextResponse.json({ error: fetchError.message }, { status: 500 });
      }

      // Unset is_primary for all other images of this product
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', currentImage.product_id)
        .neq('id', id);
    }

    // Update the target image
    const { data, error } = await supabase
      .from('product_images')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/images/[id] - Remove from storage + delete DB row
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = createAdminClient();

    // Fetch the image to get storage_path, product_id, and is_primary
    const { data: image, error: fetchError } = await supabase
      .from('product_images')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 });
      }
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Remove file from Supabase Storage
    if (image.storage_path) {
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([image.storage_path]);

      if (storageError) {
        console.error('Error removing file from storage:', storageError);
        // Continue with DB deletion even if storage removal fails
      }
    }

    // Delete the DB row
    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // If the deleted image was primary, promote the next image
    if (image.is_primary) {
      const { data: nextImage } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', image.product_id)
        .order('sort_order', { ascending: true })
        .limit(1)
        .single();

      if (nextImage) {
        await supabase
          .from('product_images')
          .update({ is_primary: true })
          .eq('id', nextImage.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

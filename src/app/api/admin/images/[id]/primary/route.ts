import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ id: string }> };

// PUT /api/admin/images/[id]/primary - Set image as primary
export async function PUT(
  _request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const supabase = createAdminClient();

    // Get the image to find its product_id
    const { data: image, error: fetchError } = await supabase
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

    // Unset is_primary for all images of this product
    await supabase
      .from('product_images')
      .update({ is_primary: false })
      .eq('product_id', image.product_id);

    // Set this image as primary
    const { data, error } = await supabase
      .from('product_images')
      .update({ is_primary: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error setting primary image:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// POST /api/admin/images/upload - Upload image to Supabase Storage + create DB row
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const productId = formData.get('product_id') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({ error: 'No se proporcionó product_id' }, { status: 400 });
    }

    // Build storage path: products/{product_id}/{timestamp}_{filename}
    const timestamp = Date.now();
    const sanitizedFilename = file.name
      .toLowerCase()
      .replace(/[^a-z0-9._-]/g, '_');
    const storagePath = `products/${productId}/${timestamp}_${sanitizedFilename}`;

    // Upload file to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(storagePath);

    const publicUrl = urlData.publicUrl;

    // Validate the public URL before creating DB record
    if (!publicUrl || publicUrl.trim() === '') {
      // Clean up the uploaded file since we can't get a valid URL
      await supabase.storage.from('product-images').remove([storagePath]);
      return NextResponse.json(
        { error: 'No se pudo obtener la URL publica de la imagen subida' },
        { status: 500 }
      );
    }

    // Check if this is the first image for the product
    const { data: existingImages, error: countError } = await supabase
      .from('product_images')
      .select('id')
      .eq('product_id', productId);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    const isPrimary = !existingImages || existingImages.length === 0;
    const sortOrder = existingImages ? existingImages.length : 0;

    // Create product_images DB row
    const { data: imageRow, error: insertError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        storage_path: storagePath,
        url: publicUrl,
        is_primary: isPrimary,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (insertError) {
      // Clean up uploaded file if DB insert fails
      await supabase.storage.from('product-images').remove([storagePath]);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        id: imageRow.id,
        url: imageRow.url,
        storage_path: imageRow.storage_path,
        is_primary: imageRow.is_primary,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

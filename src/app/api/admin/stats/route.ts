import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// GET /api/admin/stats - Return dashboard counts
// Verifies that image files actually exist in Supabase Storage
export async function GET() {
  try {
    const supabase = createAdminClient();

    // Run basic count queries in parallel
    const [productsResult, collectionsResult, testimonialsResult] =
      await Promise.all([
        supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('collections')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('testimonials')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),
      ]);

    // Fetch all image records with product name to verify storage existence
    const { data: allImages, error: imgError } = await supabase
      .from('product_images')
      .select('id, url, storage_path, product_id, is_primary, products(name)')
      .order('product_id');

    if (imgError) {
      return NextResponse.json({ error: imgError.message }, { status: 500 });
    }

    const images = allImages ?? [];

    // Collect broken image details
    interface BrokenImageDetail {
      imageId: string;
      productId: string;
      productName: string;
      storagePath: string;
      url: string;
      isPrimary: boolean;
      reason: string;
    }
    const brokenList: BrokenImageDetail[] = [];

    // Phase 1: empty URL records
    for (const img of images) {
      if (!img.url || img.url.trim() === '') {
        const productData = img.products as unknown as { name: string } | null;
        brokenList.push({
          imageId: img.id,
          productId: img.product_id,
          productName: productData?.name ?? 'Desconocido',
          storagePath: img.storage_path || '',
          url: img.url || '',
          isPrimary: img.is_primary,
          reason: 'URL vacia',
        });
      }
    }

    // Phase 2: check storage existence for images with valid URLs
    const imagesWithUrl = images.filter(
      (img) => img.url && img.url.trim() !== '' && img.storage_path && img.storage_path.trim() !== ''
    );

    const BATCH_SIZE = 15;
    for (let i = 0; i < imagesWithUrl.length; i += BATCH_SIZE) {
      const batch = imagesWithUrl.slice(i, i + BATCH_SIZE);
      const checks = await Promise.all(
        batch.map(async (img) => {
          const { error } = await supabase.storage
            .from('product-images')
            .createSignedUrl(img.storage_path, 10);
          return { img, exists: !error };
        })
      );

      for (const check of checks) {
        if (!check.exists) {
          const productData = check.img.products as unknown as { name: string } | null;
          brokenList.push({
            imageId: check.img.id,
            productId: check.img.product_id,
            productName: productData?.name ?? 'Desconocido',
            storagePath: check.img.storage_path,
            url: check.img.url,
            isPrimary: check.img.is_primary,
            reason: 'Archivo no existe en Storage',
          });
        }
      }
    }

    const totalBroken = brokenList.length;
    const totalValid = images.length - totalBroken;

    // Check for errors in basic queries
    const errors = [
      productsResult.error,
      collectionsResult.error,
      testimonialsResult.error,
    ].filter(Boolean);

    if (errors.length > 0) {
      return NextResponse.json(
        { error: errors.map((e) => e!.message).join(', ') },
        { status: 500 }
      );
    }

    return NextResponse.json({
      totalProducts: productsResult.count ?? 0,
      totalCollections: collectionsResult.count ?? 0,
      totalImages: totalValid,
      brokenImages: totalBroken,
      brokenImagesList: brokenList,
      totalTestimonials: testimonialsResult.count ?? 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

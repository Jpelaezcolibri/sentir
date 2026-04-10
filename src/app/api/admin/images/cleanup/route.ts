import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

// POST /api/admin/images/cleanup - Remove broken image records
// Detects TWO types of broken images:
// 1. Records with empty/null URL
// 2. Records with valid URL but the file doesn't exist in Supabase Storage
// SAFE: Never touches products. Only removes image records that can't display.
export async function POST() {
  try {
    const supabase = createAdminClient();

    // ============================================
    // Phase 1: Find records with empty/null URL
    // ============================================
    const { data: emptyUrlImages, error: emptyError } = await supabase
      .from('product_images')
      .select('id, product_id, storage_path, url')
      .or('url.eq.,url.is.null');

    if (emptyError) {
      return NextResponse.json({ error: emptyError.message }, { status: 500 });
    }

    // ============================================
    // Phase 2: Find records with URL but file missing in Storage
    // ============================================
    const { data: allImages, error: allError } = await supabase
      .from('product_images')
      .select('id, product_id, storage_path, url')
      .neq('url', '')
      .not('url', 'is', null);

    if (allError) {
      return NextResponse.json({ error: allError.message }, { status: 500 });
    }

    // Check each image's storage_path exists in the bucket
    // We use createSignedUrl as a lightweight existence check
    const orphanedImages: typeof allImages = [];
    const BATCH_SIZE = 10;

    for (let i = 0; i < (allImages?.length ?? 0); i += BATCH_SIZE) {
      const batch = allImages!.slice(i, i + BATCH_SIZE);
      const checks = await Promise.all(
        batch.map(async (img) => {
          if (!img.storage_path || img.storage_path.trim() === '') {
            // No storage path - can't verify, skip
            return { img, exists: true };
          }
          const { error } = await supabase.storage
            .from('product-images')
            .createSignedUrl(img.storage_path, 10);
          return { img, exists: !error };
        })
      );

      for (const check of checks) {
        if (!check.exists) {
          orphanedImages.push(check.img);
        }
      }
    }

    // ============================================
    // Phase 3: Combine all broken records
    // ============================================
    const allBroken = [
      ...(emptyUrlImages ?? []),
      ...orphanedImages,
    ];

    // Deduplicate by ID
    const seenIds = new Set<string>();
    const uniqueBroken = allBroken.filter((img) => {
      if (seenIds.has(img.id)) return false;
      seenIds.add(img.id);
      return true;
    });

    if (uniqueBroken.length === 0) {
      return NextResponse.json({
        deleted: 0,
        emptyUrl: 0,
        orphanedFiles: 0,
        message: 'No hay imagenes rotas.',
      });
    }

    // ============================================
    // Phase 4: Clean up storage files safely
    // ============================================
    const storagePaths = uniqueBroken
      .map((img) => img.storage_path)
      .filter((p): p is string => !!p && p.trim() !== '');

    let safeToDeletePaths: string[] = [];
    if (storagePaths.length > 0) {
      // Find paths also used by records NOT in our broken list
      const brokenIds = new Set(uniqueBroken.map((img) => img.id));
      const { data: allRecordsWithPaths } = await supabase
        .from('product_images')
        .select('id, storage_path')
        .in('storage_path', storagePaths);

      const pathsUsedByGoodRecords = new Set(
        (allRecordsWithPaths ?? [])
          .filter((r) => !brokenIds.has(r.id))
          .map((r) => r.storage_path)
      );

      safeToDeletePaths = storagePaths.filter((p) => !pathsUsedByGoodRecords.has(p));

      if (safeToDeletePaths.length > 0) {
        await supabase.storage.from('product-images').remove(safeToDeletePaths);
      }
    }

    // ============================================
    // Phase 5: Delete broken DB records
    // ============================================
    const brokenIds = uniqueBroken.map((img) => img.id);
    const { error: deleteError } = await supabase
      .from('product_images')
      .delete()
      .in('id', brokenIds);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // ============================================
    // Phase 6: Fix primary images for affected products
    // ============================================
    const affectedProductIds = [...new Set(
      uniqueBroken.map((img) => img.product_id).filter(Boolean)
    )];

    for (const productId of affectedProductIds) {
      const { data: primaryCheck } = await supabase
        .from('product_images')
        .select('id')
        .eq('product_id', productId)
        .eq('is_primary', true)
        .limit(1);

      if (!primaryCheck || primaryCheck.length === 0) {
        const { data: firstImage } = await supabase
          .from('product_images')
          .select('id')
          .eq('product_id', productId)
          .order('sort_order', { ascending: true })
          .limit(1)
          .single();

        if (firstImage) {
          await supabase
            .from('product_images')
            .update({ is_primary: true })
            .eq('id', firstImage.id);
        }
      }
    }

    return NextResponse.json({
      deleted: uniqueBroken.length,
      emptyUrl: (emptyUrlImages ?? []).length,
      orphanedFiles: orphanedImages.length,
      storageCleaned: safeToDeletePaths.length,
      message: `Se eliminaron ${uniqueBroken.length} registros de imagenes rotas (${(emptyUrlImages ?? []).length} sin URL + ${orphanedImages.length} con archivo inexistente).`,
    });
  } catch (error) {
    console.error('Error cleaning broken images:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

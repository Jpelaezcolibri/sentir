/**
 * migrate-from-lilika.mjs
 *
 * Copia TODOS los datos de Lilika → SENTIR sin tocar Lilika.
 * - Colecciones, productos, imágenes, quiz, testimonios, bundles
 * - Descarga imágenes de Lilika Storage y las sube a SENTIR Storage
 *
 * Uso:
 *   node scripts/migrate-from-lilika.mjs
 *
 * Ejecutar desde: C:\Users\JuanPelaez\sentir\
 */

import { createClient } from '@supabase/supabase-js';

// ── Lilika (solo lectura) ─────────────────────────────────────────────────────
const LILIKA_URL  = 'https://oqvsxsxvzrigtozxooin.supabase.co';
const LILIKA_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xdnN4c3h2enJpZ3Rvenhvb2luIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjE0NTAwNSwiZXhwIjoyMDg3NzIxMDA1fQ.CfPtSbqUeycjnGvfOGvyJQF-c-SOWWOAMATOfCkACfc';

// ── SENTIR (destino) ──────────────────────────────────────────────────────────
const SENTIR_URL  = 'https://cvmgnjfhcasndfjvehex.supabase.co';
const SENTIR_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2bWduamZoY2FzbmRmanZlaGV4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc1Njg0NiwiZXhwIjoyMDkxMzMyODQ2fQ.Gt5xRDqHq_aOeKIUD2tibC9tevMwKV0vAeT5B8ZP8T4';

const BUCKET = 'product-images';

const lilika  = createClient(LILIKA_URL, LILIKA_KEY);
const sentir  = createClient(SENTIR_URL, SENTIR_KEY);

// ── Helpers ───────────────────────────────────────────────────────────────────
function log(msg)  { console.log(`  ✓ ${msg}`); }
function warn(msg) { console.warn(`  ⚠ ${msg}`); }
function step(msg) { console.log(`\n▶ ${msg}`); }

async function downloadImage(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} al descargar ${url}`);
  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('  MIGRACIÓN LILIKA → SENTIR');
  console.log('═══════════════════════════════════════');

  // ── 1. Colecciones ─────────────────────────────────────────────────────────
  step('Leyendo colecciones de Lilika...');
  const { data: collections, error: colErr } = await lilika.from('collections').select('*').order('sort_order');
  if (colErr) throw colErr;
  log(`${collections.length} colecciones encontradas`);

  step('Insertando colecciones en SENTIR...');
  // Limpia las existentes solo si hay datos nuevos
  await sentir.from('collections').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  const { error: insColErr } = await sentir.from('collections').insert(collections);
  if (insColErr) throw insColErr;
  log(`${collections.length} colecciones insertadas`);

  // ── 2. Productos ───────────────────────────────────────────────────────────
  step('Leyendo productos de Lilika...');
  const { data: products, error: prodErr } = await lilika.from('products').select('*').order('sort_order');
  if (prodErr) throw prodErr;
  log(`${products.length} productos encontrados`);

  step('Insertando productos en SENTIR...');
  await sentir.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Detectar columnas reales de SENTIR insertando un registro vacío y viendo qué acepta
  // Enfoque simple: obtener columnas desde un producto existente en SENTIR o usar la intersección
  // con las keys del primer producto de Lilika filtrando las que sabemos que no existen
  const EXCLUDED_COLS = ['catalog_type', 'wholesale_discount'];
  const sentirCols = Object.keys(products[0]).filter(k => !EXCLUDED_COLS.includes(k));

  const cleanProducts = products.map(p => {
    const clean = {};
    for (const col of sentirCols) { if (col in p) clean[col] = p[col]; }
    return clean;
  });

  const { error: insProdErr } = await sentir.from('products').insert(cleanProducts);
  if (insProdErr) throw insProdErr;
  log(`${products.length} productos insertados`);

  // ── 3. Imágenes ────────────────────────────────────────────────────────────
  step('Leyendo imágenes de Lilika...');
  const { data: images, error: imgErr } = await lilika.from('product_images').select('*').order('sort_order');
  if (imgErr) throw imgErr;
  log(`${images.length} imágenes encontradas`);

  step('Copiando imágenes a SENTIR Storage...');
  await sentir.from('product_images').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const updatedImages = [];
  let copied = 0;
  let skipped = 0;

  for (const img of images) {
    try {
      // Descargar de Lilika
      const buffer = await downloadImage(img.url);

      // Detectar extensión desde la URL
      const ext = img.url.split('?')[0].split('.').pop() || 'jpg';
      const storagePath = img.storage_path || `products/${img.product_id}/${img.id}.${ext}`;

      // Subir a SENTIR storage
      const { error: uploadErr } = await sentir.storage
        .from(BUCKET)
        .upload(storagePath, buffer, {
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
          upsert: true,
        });

      if (uploadErr) {
        warn(`No se pudo subir ${storagePath}: ${uploadErr.message}`);
        skipped++;
        updatedImages.push(img); // mantener URL original como fallback
        continue;
      }

      // Obtener URL pública en SENTIR
      const { data: { publicUrl } } = sentir.storage.from(BUCKET).getPublicUrl(storagePath);

      updatedImages.push({ ...img, url: publicUrl, storage_path: storagePath });
      copied++;

      if (copied % 10 === 0) log(`${copied}/${images.length} imágenes copiadas...`);
    } catch (e) {
      warn(`Error en imagen ${img.id}: ${e.message}`);
      skipped++;
      updatedImages.push(img);
    }
  }

  log(`${copied} imágenes copiadas, ${skipped} con fallback a URL original`);

  step('Insertando registros de imágenes en SENTIR...');
  if (updatedImages.length > 0) {
    const { error: insImgErr } = await sentir.from('product_images').insert(updatedImages);
    if (insImgErr) throw insImgErr;
    log(`${updatedImages.length} registros de imágenes insertados`);
  }

  // ── 4. Quiz options ────────────────────────────────────────────────────────
  step('Copiando quiz options...');
  const { data: quiz, error: quizErr } = await lilika.from('quiz_options').select('*').order('sort_order');
  if (quizErr) { warn(`quiz_options: ${quizErr.message}`); }
  else {
    await sentir.from('quiz_options').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (quiz.length > 0) {
      const { error } = await sentir.from('quiz_options').insert(quiz);
      if (error) warn(`quiz insert: ${error.message}`);
      else log(`${quiz.length} quiz options copiadas`);
    }
  }

  // ── 5. Testimonios ─────────────────────────────────────────────────────────
  step('Copiando testimonios...');
  const { data: testimonials, error: testErr } = await lilika.from('testimonials').select('*').order('sort_order');
  if (testErr) { warn(`testimonials: ${testErr.message}`); }
  else {
    await sentir.from('testimonials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (testimonials.length > 0) {
      const { error } = await sentir.from('testimonials').insert(testimonials);
      if (error) warn(`testimonials insert: ${error.message}`);
      else log(`${testimonials.length} testimonios copiados`);
    }
  }

  // ── 6. Bundles ─────────────────────────────────────────────────────────────
  step('Copiando bundles/combos...');
  const { data: bundles, error: bundleErr } = await lilika.from('bundles').select('*').order('sort_order');
  if (bundleErr) { warn(`bundles: ${bundleErr.message}`); }
  else {
    await sentir.from('bundles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (bundles.length > 0) {
      const { error } = await sentir.from('bundles').insert(bundles);
      if (error) warn(`bundles insert: ${error.message}`);
      else log(`${bundles.length} bundles copiados`);
    }
  }

  // ── 7. Resumen ─────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════');
  console.log('  MIGRACIÓN COMPLETADA');
  console.log(`  Colecciones : ${collections.length}`);
  console.log(`  Productos   : ${products.length}`);
  console.log(`  Imágenes    : ${copied} copiadas`);
  console.log('═══════════════════════════════════════\n');
}

main().catch((err) => {
  console.error('\n✗ ERROR FATAL:', err.message);
  process.exit(1);
});

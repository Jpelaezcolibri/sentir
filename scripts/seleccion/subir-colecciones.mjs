/**
 * subir-colecciones.mjs
 *
 * Crea (solo INSERT, no borra nada) en producción de SENTIR:
 *   - Colección "Sintiendo la Selección"  → Corazones Colombia, Selección Colombia  ($58.000)
 *   - Colección "Sentir lo nuevo"          → Espresso Martini, Little Pinch of Love, Pickleball ($50.000)
 *
 * Recorta la marca de agua "Meta AI" de las fotos en modelo antes de subir.
 * Es idempotente por slug: si la colección ya existe, la reutiliza y no duplica.
 *
 * Uso:  node scripts/seleccion/subir-colecciones.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');
const IMG = (f) => join(__dirname, f);

// ── Credenciales (desde .env.local) ────────────────────────────────────────
const env = Object.fromEntries(
  readFileSync(join(ROOT, '.env.local'), 'utf8')
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()]; })
);
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
const BUCKET = 'product-images';

const log = (m) => console.log('  ✓ ' + m);
const step = (m) => console.log('\n▶ ' + m);

// ── Definición de colecciones y productos ───────────────────────────────────
const COLLECTIONS = [
  {
    name: 'Sintiendo la Selección',
    slug: 'sintiendo-la-seleccion',
    icon: '⚽',
    color: '#E8C040',
    color_light: '#FFF3C4',
    price_range: '$58.000',
    short_description: 'El orgullo tricolor hecho para sentirse.',
    description: 'Prendas que llevan el corazón de Colombia. Tricolor, fútbol y pasión para vibrar con la Selección.',
    story: 'Hay un sentimiento que nos une a todos: el amarillo, azul y rojo en la piel. Esta colección celebra ese orgullo de sentirnos Colombia.',
    sort_order: 8,
    is_active: true,
    products: [
      {
        name: 'Corazones Colombia',
        story: 'Camiseta blanca con corazones tricolor bordados y la frase "soy Colombia". El orgullo en cada detalle.',
        tags: ['colombia', 'seleccion', 'corazones', 'tricolor'],
        images: [
          { file: 'colombia-corazones-modelo.png', cropBottomPct: 0.075 },
          { file: 'colombia-corazones-flat.png' },
        ],
      },
      {
        name: 'Selección Colombia',
        story: 'Camiseta estilo jersey de la Selección con franja tricolor. Para sentir la pasión del fútbol colombiano.',
        tags: ['colombia', 'seleccion', 'futbol', 'jersey'],
        images: [{ file: 'colombia-jersey.png' }],
      },
    ],
  },
  {
    name: 'Sentir lo nuevo',
    slug: 'sentir-lo-nuevo',
    icon: '🆕',
    color: '#C4687A',
    color_light: '#F5D5DC',
    price_range: '$50.000',
    short_description: 'Lo último que llegó para sentirse diferente.',
    description: 'Los nuevos diseños de Sentir: frescos, divertidos y con actitud. Lo que acaba de llegar.',
    story: 'Siempre hay algo nuevo que sentir. Esta colección reúne los diseños recién llegados que rompen la rutina.',
    sort_order: 9,
    is_active: true,
    products: [
      {
        name: 'Espresso Martini',
        story: 'Camiseta "Espresso Martini — Cocktail & Social Club". Para las que sienten la noche con estilo.',
        tags: ['nuevo', 'espresso', 'martini', 'cocktail'],
        images: [{ file: 'martini.png', cropBottomPct: 0.075 }],
      },
      {
        name: 'Little Pinch of Love',
        story: 'Camiseta con cangrejo rosa y la frase "Little Pinch of Love". Dulce, divertida y con personalidad.',
        tags: ['nuevo', 'love', 'cangrejo', 'rosa'],
        images: [{ file: 'cangrejo.png', cropBottomPct: 0.075 }],
      },
      {
        name: 'Pickleball League',
        story: 'Camiseta "Out Of Your League — Pickleball League!". Para las que sienten el deporte de moda.',
        tags: ['nuevo', 'pickleball', 'deporte'],
        images: [{ file: 'pickleball.png' }],
      },
    ],
  },
];

// Defaults de producto
const PRICE_BY_SLUG = { 'sintiendo-la-seleccion': 58000, 'sentir-lo-nuevo': 50000 };
const FABRIC = 'Tela fría algodón';
const CATALOG = 'general';
const SIZES = ['S', 'M', 'L', 'XL'];
const COLORS = JSON.stringify(['Blanco']);

function slugId(name) {
  const base = name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  return `${base}-sel${Math.random().toString(36).slice(2, 5)}`;
}

async function getImageBuffer(img) {
  const path = IMG(img.file);
  if (img.cropBottomPct) {
    const meta = await sharp(path).metadata();
    const newH = meta.height - Math.round(meta.height * img.cropBottomPct);
    return sharp(path).extract({ left: 0, top: 0, width: meta.width, height: newH }).png().toBuffer();
  }
  return sharp(path).png().toBuffer();
}

async function main() {
  console.log('\n═══════════════════════════════════════');
  console.log('  SUBIENDO COLECCIONES A SENTIR (producción)');
  console.log('═══════════════════════════════════════');

  for (const col of COLLECTIONS) {
    step(`Colección: ${col.name}`);

    // ¿Ya existe por slug?
    const { data: existing } = await sb.from('collections').select('id').eq('slug', col.slug).maybeSingle();
    let collectionId;
    if (existing) {
      collectionId = existing.id;
      log(`Ya existía (id=${collectionId}), se reutiliza.`);
    } else {
      const { products, ...colRow } = col;
      void products;
      const { data: inserted, error } = await sb.from('collections')
        .insert({ id: crypto.randomUUID(), ...colRow }).select('id').single();
      if (error) throw new Error(`collection ${col.slug}: ${error.message}`);
      collectionId = inserted.id;
      log(`Creada (id=${collectionId}).`);
    }

    // Productos
    let prodOrder = 0;
    for (const p of col.products) {
      const productId = slugId(p.name);
      const { error: pErr } = await sb.from('products').insert({
        id: productId,
        collection_id: collectionId,
        name: p.name,
        price: PRICE_BY_SLUG[col.slug],
        fabric: FABRIC,
        catalog: CATALOG,
        sizes: SIZES,
        colors: COLORS,
        story: p.story,
        tags: p.tags,
        is_active: true,
        is_new: true,
        sort_order: prodOrder,
      });
      if (pErr) throw new Error(`product ${p.name}: ${pErr.message}`);
      log(`Producto: ${p.name} (id=${productId})`);

      // Imágenes
      let imgOrder = 0;
      for (const img of p.images) {
        const buffer = await getImageBuffer(img);
        const ts = Date.now();
        const storagePath = `products/${productId}/${ts}_${img.file}`;
        const { error: upErr } = await sb.storage.from(BUCKET)
          .upload(storagePath, buffer, { contentType: 'image/png', upsert: false });
        if (upErr) throw new Error(`upload ${img.file}: ${upErr.message}`);
        const { data: { publicUrl } } = sb.storage.from(BUCKET).getPublicUrl(storagePath);
        const { error: imgErr } = await sb.from('product_images').insert({
          product_id: productId,
          storage_path: storagePath,
          url: publicUrl,
          is_primary: imgOrder === 0,
          sort_order: imgOrder,
        });
        if (imgErr) throw new Error(`image row ${img.file}: ${imgErr.message}`);
        log(`  imagen: ${img.file}${img.cropBottomPct ? ' (recortada)' : ''} → subida`);
        imgOrder++;
      }
      prodOrder++;
    }
  }

  console.log('\n═══════════════════════════════════════');
  console.log('  ✓ COMPLETADO');
  console.log('═══════════════════════════════════════\n');
}

main().catch((err) => { console.error('\n✗ ERROR:', err.message); process.exit(1); });

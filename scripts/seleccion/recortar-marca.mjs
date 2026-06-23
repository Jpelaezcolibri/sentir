/**
 * recortar-marca.mjs
 *
 * Recorta la franja inferior con la marca de agua (Meta AI / Dola AI)
 * de las fotos de la colección "Sintiendo la Selección".
 *
 * Uso:
 *   node scripts/seleccion/recortar-marca.mjs
 *
 * - Lee todas las imágenes de  scripts/seleccion/  (jpg/jpeg/png/webp)
 * - Recorta un % de la parte inferior (donde está la marca)
 * - Guarda las versiones limpias en  scripts/seleccion/limpias/
 *
 * Ajustes:
 *   DEFAULT_BOTTOM_PCT  → cuánto recortar por defecto (fracción del alto)
 *   OVERRIDES           → recorte específico por nombre de archivo
 */

import { readdir, mkdir } from 'node:fs/promises';
import { join, extname, basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC_DIR = __dirname;
const OUT_DIR = join(__dirname, 'limpias');

// Fracción del alto a recortar desde abajo (la marca suele estar en el ~4-6% inferior)
const DEFAULT_BOTTOM_PCT = 0.05;

// Override por nombre de archivo (ej: { 'foto1.jpg': 0.08 })
const OVERRIDES = {};

const VALID_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const entries = await readdir(SRC_DIR, { withFileTypes: true });
  const files = entries
    .filter((e) => e.isFile() && VALID_EXT.has(extname(e.name).toLowerCase()))
    .map((e) => e.name);

  if (files.length === 0) {
    console.log('⚠ No hay imágenes en', SRC_DIR);
    console.log('  Deja aquí las fotos (jpg/png/webp) y vuelve a correr el script.');
    return;
  }

  console.log(`\n▶ Procesando ${files.length} imagen(es)...\n`);

  for (const name of files) {
    const inPath = join(SRC_DIR, name);
    const img = sharp(inPath);
    const meta = await img.metadata();
    const { width, height } = meta;

    const pct = OVERRIDES[name] ?? DEFAULT_BOTTOM_PCT;
    const cropPx = Math.round(height * pct);
    const newHeight = height - cropPx;

    const outPath = join(OUT_DIR, name);
    await sharp(inPath)
      .extract({ left: 0, top: 0, width, height: newHeight })
      .toFile(outPath);

    console.log(
      `  ✓ ${name}  ${width}x${height} → ${width}x${newHeight}  (recorte ${cropPx}px = ${(pct * 100).toFixed(1)}%)`
    );
  }

  console.log(`\n✓ Listo. Imágenes limpias en: ${OUT_DIR}\n`);
}

main().catch((err) => {
  console.error('\n✗ ERROR:', err.message);
  process.exit(1);
});

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

// Encoding/resizing only. Keeps the original and does not retouch or alter composition.
const [source, destination, width = '800'] = process.argv.slice(2);
if (!source || !destination || !Number.isInteger(Number(width)) || Number(width) < 1) throw new Error('Usage: node scripts/optimise-image.mjs source destination.webp [width]');
await mkdir(path.dirname(destination), { recursive: true });
await sharp(source).rotate().resize({ width: Number(width), withoutEnlargement: true }).webp({ quality: 86, effort: 5 }).toFile(destination);
console.log(destination);

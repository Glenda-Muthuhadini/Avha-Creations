import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { hairPhotos } from '../src/data/hairPhotography.js';

const destination = 'public/images/hair/optimized';
await mkdir(destination, { recursive: true });
// Resize and encode only; supplied originals are retained without retouching.
for (const photo of Object.values(hairPhotos)) {
  for (const width of photo.slug === 'sleek-high-ponytail' ? [480, 800, 1254] : [480, 800]) {
    await sharp(`public/images/Hair images/${photo.filename}`).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 86, effort: 5 }).toFile(`${destination}/${photo.slug}-${width}.webp`);
  }
}
console.log(`Optimised ${Object.keys(hairPhotos).length} supplied hair photographs.`);

import sharp from 'sharp';

// Preserve the supplied PNGs; generate responsive, encoding-only derivatives.
const photos = [
  ['Bohemian Black Fringe Bag in Sunlight', 'black-crochet-fringe-bag'],
  ['ChatGPT Image Oct 25, 2026, 06_26_00 PM', 'blue-yellow-crochet-sunhat'],
  ['Sunlit Tropical Beach Glamour', 'blue-yellow-crochet-sunhat-worn'],
  ['Cozy Mustard Crochet Hat and Scarf', 'mustard-crochet-hat-scarf-set'],
  ['Warm Mustard Knit Beauty Portrait', 'mustard-crochet-hat-scarf-set-worn'],
  ['Crocheted Santa Hats on Mannequins', 'crochet-santa-hat'],
  ['Emerald Crochet Baby Dress Set', 'emerald-crochet-baby-dress-set'],
  ['Handmade Crochet Scrunchies in Warm Sunlight', 'ruffle-crochet-scrunchies'],
  ['Sunlit Crochet Beanie Portrait', 'yellow-red-crochet-beanie'],
  ['Sunlit Red Looped-Yarn Handbag', 'red-looped-yarn-handbag'],
  ['Vibrant Crochet Bucket Hat Display', 'crochet-bucket-hat'],
  ['Vibrant Crochet Hat and Earring Portrait', 'rasta-crochet-hat-earring-set'],
];
for (const [filename, slug] of photos) {
  for (const width of [480, 800]) {
    await sharp(`public/images/products/optimized/${filename}.png`).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 86, effort: 5 }).toFile(`public/images/products/optimized/${slug}-${width}.webp`);
  }
}
console.log(`Optimised ${photos.length} product photographs.`);

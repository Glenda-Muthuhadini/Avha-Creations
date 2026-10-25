export const shopCategories = [
  { slug: 'hats-fascinators', name: 'Hats & Fascinators', image: '/images/products/optimized/purple-pink-crochet-hat-480.webp' },
  { slug: 'bags', name: 'Bags', image: '/images/products/optimized/crimson-crochet-bag-480.webp' },
  { slug: 'jewellery', name: 'Jewellery', image: '/images/products/optimized/amber-loop-earrings-480.webp' },
  { slug: 'crochet', name: 'Crochet', image: '/images/products/optimized/ivory-mauve-drawstring-pouch-480.webp' },
  { slug: 'dresses', name: 'Dresses', image: '/images/products/optimized/pastel-rainbow-crochet-dress-480.webp' },
  { slug: 'occasion-pieces', name: 'Occasion Pieces', image: '/images/avha-hero-768.webp' },
];

export function categoryPresentation(categories) {
  const visibleCategories = categories.filter(category => category.slug !== 'accessories');
  const presented = shopCategories.map(category => ({
    ...category,
    ...visibleCategories.find(record => record.slug === category.slug),
    name: category.name,
  }));
  return [...presented, ...visibleCategories.filter(category => !shopCategories.some(preset => preset.slug === category.slug))
    .map(category => ({ ...category, image: '/images/crochet-bag.webp' }))];
}

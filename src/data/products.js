const product = (slug, name, filename, price, categories) => ({
  id: `collection-${slug}`,
  slug,
  name,
  images: [`/images/products/optimized/${slug}-800.webp`],
  image_srcset: `/images/products/optimized/${slug}-480.webp 480w, /images/products/optimized/${slug}-800.webp 800w`,
  original_image: `/images/products/${encodeURIComponent(filename)}.png`,
  price,
  categories,
  active: true,
  featured: true,
  stock_status: 'made_to_order',
  description: 'Handcrafted by AVHA Creations. Enquire about your preferred colours, custom details and availability. The price shown is a starting price; your final quote is confirmed with AVHA.',
  preview: true,
});

export const collectionProducts = [
  product('purple-pink-crochet-hat', 'Purple & Pink Ruffle Hat', 'Vibrant Purple and Pink Crochet Hat', 250, ['hats-fascinators', 'crochet', 'occasion-pieces']),
  product('crimson-crochet-bag', 'Crimson Crochet Bag with Butterfly Brooch', 'Crimson Crochet Bag with Butterfly Brooch', 450, ['bags', 'crochet']),
  product('amber-loop-earrings', 'Amber Loop Beaded Earrings', 'Beaded Amber Loop Earrings Display', 30, ['jewellery', 'accessories', 'occasion-pieces']),
  product('teal-crochet-handbag', 'Teal Crochet Handbag with Gold Chain', 'Teal Crochet Handbag with Gold Chain', 450, ['bags', 'crochet']),
  product('beaded-fringe-earrings', 'Vibrant Beaded Fringe Earrings', 'Vibrant Beaded Fringe Earrings', 30, ['jewellery', 'accessories', 'occasion-pieces']),
  product('ivory-mauve-drawstring-pouch', 'Ivory & Mauve Crochet Drawstring Pouch', 'Crocheted Ivory and Mauve Drawstring Pouch', 450, ['bags', 'crochet']),
  product('two-tone-blue-bucket-bag', 'Two-Tone Blue Crochet Bucket Bag', 'Two-Tone Blue Crochet Bucket Bag', 450, ['bags', 'crochet']),
  product('turquoise-crochet-bikini', 'Turquoise Crochet Bikini', 'Turquoise Crochet Bikini Flatlay', 200, ['crochet', 'occasion-pieces']),
  product('sunflower-scrunchie-pair', 'Crocheted Sunflower Scrunchie Pair', 'Crocheted Sunflower Scrunchie Pair', 80, ['crochet', 'accessories']),
];

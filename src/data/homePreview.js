// Homepage-only editorial previews. These are never database records or cart items.
const service = (slug, name, image) => ({ id: `preview-${slug}`, slug, name, images: [image], price_from: null, preview: true });
export const previewServices = [
  service('braids', 'Braids', '/images/braids.webp'),
  service('cornrows', 'Cornrows', '/images/cornrows.webp'),
  service('wig-making-installation', 'Wig Making & Installation', '/images/wig-installation.webp'),
  service('hair-dyeing', 'Hair Dyeing', '/images/hair-colour.webp'),
  service('hair-washing', 'Hair Washing', '/images/hair-washing.webp'),
  service('custom-styling', 'Custom Styling', '/images/custom-styling.webp'),
];

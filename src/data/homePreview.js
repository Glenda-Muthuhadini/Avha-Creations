// Homepage-only editorial previews. These are never database records or cart items.
import { hairServicePhotos } from './hairPhotography.js';
const service = (slug, name) => ({ id: `preview-${slug}`, slug, name, images: [hairServicePhotos[slug].src], image_srcset: hairServicePhotos[slug].srcSet, image_alt: hairServicePhotos[slug].alt, price_from: null, preview: true });
export const previewServices = [
  service('braids', 'Braids'),
  service('cornrows', 'Cornrows'),
  service('wig-making-installation', 'Wig Making & Installation'),
  service('hair-dyeing', 'Hair Dyeing'),
  service('hair-washing', 'Hair Washing'),
  service('custom-styling', 'Custom Styling'),
];

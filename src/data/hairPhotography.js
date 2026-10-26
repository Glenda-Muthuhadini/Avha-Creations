const photo = (slug, filename, alt) => ({
  slug,
  filename,
  src: `/images/hair/optimized/${slug}-800.webp`,
  srcSet: `/images/hair/optimized/${slug}-480.webp 480w, /images/hair/optimized/${slug}-800.webp 800w`,
  alt,
});

export const hairPhotos = {
  curledBraids: photo('curled-braids', 'Braided Curls in a Salon Setting.png', 'Brown and black braids gathered into a side-swept style with curled ends.'),
  bridal: photo('bridal-styling', 'Bridesmaid Robes and Bridal Preparations.png', 'Bridesmaids with a decorated updo and a sleek high ponytail.'),
  decorativeLocs: photo('decorative-locs', 'Decorative Locs in a Sunlit Courtyard.png', 'Long black locs with decorative thread and geometric partings.'),
  flowerGirls: photo('flower-girl-buns', 'Four Flower Girls in Lace Dresses.png', 'Four flower girls with high buns and white floral hair accessories.'),
  geometricBraids: photo('geometric-braids-ponytail', 'Geometric Braids and Sleek Ponytail.png', 'Geometric side braids flowing into a long, straight high ponytail.'),
  chunkyTwists: photo('geometric-chunky-twists', 'Geometric Chunky Twists in a Salon.png', 'Chunky black twists with neat geometric sections at the scalp.'),
  cornrowBun: photo('cornrows-honey-blonde-bun', 'Glossy Cornrows with Honey-Blonde Bun.png', 'Curved cornrows gathered into a black and honey-blonde braided bun.'),
  ombreCornrows: photo('ombre-cornrows', 'Glossy Ombre Braids in a Yellow Hoodie.png', 'Fine curved cornrows with long braids and golden curled ends.'),
  honeyBraids: photo('honey-brown-box-braids', 'Honey Brown Box Braids with Curled Ends.png', 'Long honey-brown box braids with curled ends and square partings.'),
  blueBraids: photo('icy-blue-braids', 'Icy Blue Braids in a Sunlit Courtyard.png', 'Long icy-blue braids with loose curled ends, viewed from behind.'),
  multitoneLocs: photo('multitone-faux-locs', 'Long Multitone Faux Locs Portrait.png', 'Long black and honey-brown faux locs with geometric partings.'),
  profileBraids: photo('profile-ombre-braids', 'Profile Portrait with Ombre Braids.png', 'Side profile of brown ombre braids with soft curled ends.'),
  ponytail: photo('sleek-high-ponytail', 'Sleek High Ponytail Portrait.png', 'A sleek high ponytail with long, full textured hair, shown in profile.'),
  texturedLocs: photo('textured-locs', 'Textured Locs Portrait in a Neutral Interior.png', 'Shoulder-length black textured locs with defined sections at the roots.'),
  longOmbreBraids: photo('long-ombre-braids', 'Very Long Ombre Braids in Garage Setting.png', 'Very long black braids fading into pale blonde ends.'),
  purpleBraids: photo('purple-braids', 'Vivid Purple Braids in Courtyard.png', 'Long vivid purple braids with curled ends, viewed from behind.'),
};

export const hairHero = {
  ...hairPhotos.ponytail,
  src: '/images/hair/optimized/sleek-high-ponytail-1254.webp',
  srcSet: '/images/hair/optimized/sleek-high-ponytail-800.webp 800w, /images/hair/optimized/sleek-high-ponytail-1254.webp 1254w',
};

// Supplied hairstyle references; these do not depict washing or dye application.
export const hairServicePhotos = {
  braids: hairPhotos.honeyBraids,
  cornrows: hairPhotos.cornrowBun,
  'wig-making-installation': hairPhotos.ponytail,
  'hair-dyeing': hairPhotos.purpleBraids,
  'hair-washing': hairPhotos.texturedLocs,
  'custom-styling': hairPhotos.geometricBraids,
};

export const hairWorkPhotos = [
  hairPhotos.honeyBraids, hairPhotos.cornrowBun, hairPhotos.geometricBraids,
  hairPhotos.decorativeLocs, hairPhotos.curledBraids, hairPhotos.ponytail,
  hairPhotos.chunkyTwists, hairPhotos.ombreCornrows, hairPhotos.blueBraids,
  hairPhotos.multitoneLocs, hairPhotos.profileBraids, hairPhotos.texturedLocs,
  hairPhotos.longOmbreBraids, hairPhotos.purpleBraids, hairPhotos.bridal, hairPhotos.flowerGirls,
];

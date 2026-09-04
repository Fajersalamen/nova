export const brand = {
  name: 'Frankies Cake',
  monogram: 'FC',
  phone: '+962 7 9966 8613',
  phoneHref: 'tel:+962799668613',
  address: 'AlJubiha Club, Jawhar As Siqilill, Amman',
  hours: 'Open daily from 8:00 AM',
  services: ['Delivery', 'Takeaway', 'On-site services'],
};

export const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'Cakes', href: '#cakes' },
  { label: 'Collections', href: '#collections' },
  { label: 'About', href: '#about' },
  { label: 'Custom Cakes', href: '#custom' },
  { label: 'Contact', href: '#contact' },
];

export const collections = [
  {
    slug: 'special-vanilla',
    title: 'The Special Edit',
    description: 'Elevated pairings — pistachio, lotus, and berries.',
    image: '/images/cakes/pistachio-royale.webp',
  },
  {
    slug: 'special',
    title: 'Naked & Wrapped',
    description: 'Red velvet and berries, finished in satin ribbon.',
    image: '/images/cakes/ribbon-strawberry.webp',
  },
  {
    slug: 'extra-special',
    title: 'Extra Special',
    description: 'Chocolate Dubai, cacao seeds, and velvet in violet.',
    image: '/images/cakes/chocolate-dubai.webp',
  },
  {
    slug: 'tiramisu',
    title: 'Tiramisu Collection',
    description: 'Espresso, mascarpone, and ladyfingers — done right.',
    image: '/images/cakes/tiramisu-cream.webp',
  },
  {
    slug: 'regular-chocolate',
    title: 'Everyday Chocolate',
    description: 'Blackforest, Kinder, and Nutella — the essentials.',
    image: '/images/cakes/blackforest.webp',
  },
  {
    slug: 'regular-vanilla',
    title: 'Everyday Vanilla',
    description: 'Soft vanilla sponge dressed with fresh strawberries.',
    image: '/images/cakes/strawberry-classic.webp',
  },
] as const;

export const testimonials = [
  {
    name: 'Lina K.',
    role: 'Amman',
    rating: 5,
    quote:
      'The Pistachio Royale looked too beautiful to cut into — and then it tasted even better. Every layer was balanced, nothing overly sweet.',
  },
  {
    name: 'Omar H.',
    role: 'Abdoun',
    rating: 5,
    quote:
      'We ordered the Chocolate Dubai for a birthday and it disappeared in minutes. Genuinely one of the best cakes I have had in Amman.',
  },
  {
    name: 'Rana S.',
    role: 'Jubaiha',
    rating: 5,
    quote:
      'Frankies handled our wedding dessert table beautifully. Every detail felt considered, from the ribboned finish to the delivery timing.',
  },
  {
    name: 'Yousef A.',
    role: 'Sweifieh',
    rating: 5,
    quote:
      'Custom order, done exactly to brief. The team walked us through flavor and size options and it arrived looking better than the reference photo.',
  },
] as const;

export const galleryImages = [
  '/images/cakes/chocolate-dubai.webp',
  '/images/cakes/red-velvet.webp',
  '/images/cakes/pistachio-royale.webp',
  '/images/cakes/tiramisu-hero.webp',
  '/images/cakes/purple-velvet.webp',
  '/images/cakes/strawberry-dream.webp',
  '/images/cakes/lotus-cream.webp',
  '/images/cakes/ribbon-strawberry.webp',
  '/images/cakes/cacao-seeds.webp',
] as const;

export const customCakeOptions = {
  fillings: ['Vanilla Cream', 'Chocolate Ganache', 'Cream Cheese', 'Fresh Fruit Compote', 'Pistachio Cream'],
  colors: [
    { name: 'Ivory', hex: '#FBF4EA' },
    { name: 'Blush', hex: '#D9A594' },
    { name: 'Cocoa', hex: '#3A2A20' },
    { name: 'Sage', hex: '#93A388' },
    { name: 'Gold', hex: '#BD9457' },
    { name: 'Berry', hex: '#8C2F39' },
  ],
  decorations: ['Fresh Berries', 'Gold Leaf', 'Chocolate Shards', 'Piped Florals', 'Ribbon Wrap', 'Minimal / Clean'],
};

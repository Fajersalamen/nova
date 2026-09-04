export type SizeOption = {
  code: 'XS' | 'S' | 'M' | 'L';
  inches: number;
  price: number;
};

export type Flavor = {
  slug: string;
  name: string;
  image: string;
  blurb: string;
};

export type Category = {
  slug: string;
  name: string;
  shortName: string;
  tagline: string;
  sizes: SizeOption[];
  flavors: Flavor[];
};

const IMG = (name: string) => `/images/cakes/${name}.webp`;

export const categories: Category[] = [
  {
    slug: 'regular-vanilla',
    name: 'Regular Vanilla',
    shortName: 'Regular',
    tagline: 'A soft vanilla crumb, finished with fruit and cream.',
    sizes: [
      { code: 'XS', inches: 6, price: 7 },
      { code: 'S', inches: 10, price: 10 },
      { code: 'M', inches: 14, price: 15 },
      { code: 'L', inches: 20, price: 20 },
    ],
    flavors: [
      {
        slug: 'strawberry-dream',
        name: 'Strawberry Dream',
        image: IMG('strawberry-dream'),
        blurb: 'Vanilla sponge, whipped cream, and glazed strawberries piled high.',
      },
      {
        slug: 'strawberry-classic',
        name: 'Strawberry Classic',
        image: IMG('strawberry-classic'),
        blurb: 'A quiet classic — vanilla cream finished with a glossy strawberry crown.',
      },
    ],
  },
  {
    slug: 'regular-chocolate',
    name: 'Regular Chocolate',
    shortName: 'Regular',
    tagline: 'Rich cocoa sponge layered with silky chocolate cream.',
    sizes: [
      { code: 'XS', inches: 6, price: 7 },
      { code: 'S', inches: 10, price: 10 },
      { code: 'M', inches: 14, price: 15 },
      { code: 'L', inches: 20, price: 20 },
    ],
    flavors: [
      {
        slug: 'blackforest',
        name: 'Blackforest',
        image: IMG('blackforest'),
        blurb: 'Dark chocolate shavings, cherries, and clouds of whipped cream.',
      },
      {
        slug: 'nutella-strawberry',
        name: 'Nutella Strawberry',
        image: IMG('nutella-strawberry'),
        blurb: 'A hazelnut-chocolate drip finished with fresh strawberries.',
      },
      {
        slug: 'kinder',
        name: 'Kinder',
        image: IMG('kinder'),
        blurb: 'Milk chocolate ganache and crushed wafer, for the chocolate purist.',
      },
    ],
  },
  {
    slug: 'special-vanilla',
    name: 'Special Vanilla',
    shortName: 'Special',
    tagline: 'Elevated flavor pairings, dressed for the occasion.',
    sizes: [
      { code: 'XS', inches: 6, price: 8 },
      { code: 'S', inches: 10, price: 12 },
      { code: 'M', inches: 14, price: 17 },
      { code: 'L', inches: 20, price: 22 },
    ],
    flavors: [
      {
        slug: 'pistachio-royale',
        name: 'Pistachio Royale',
        image: IMG('pistachio-royale'),
        blurb: 'A pistachio mirror glaze over raspberry cream — quietly showstopping.',
      },
      {
        slug: 'lotus-cream',
        name: 'Lotus Cream',
        image: IMG('lotus-cream'),
        blurb: 'Spiced biscuit cream, finished with a warm caramelized drip.',
      },
      {
        slug: 'mixed-berries',
        name: 'Mixed Berries',
        image: IMG('mixed-berries'),
        blurb: 'A naked-style vanilla cake, stacked high with seasonal berries.',
      },
    ],
  },
  {
    slug: 'special',
    name: 'Special',
    shortName: 'Special',
    tagline: 'Naked-style layers, wrapped for a gift-worthy finish.',
    sizes: [
      { code: 'S', inches: 10, price: 12 },
      { code: 'M', inches: 14, price: 17 },
      { code: 'L', inches: 20, price: 22 },
    ],
    flavors: [
      {
        slug: 'red-velvet',
        name: 'Red Velvet',
        image: IMG('red-velvet'),
        blurb: 'Velvet-soft crumb, cream cheese frosting, dressed in berries.',
      },
      {
        slug: 'ribbon-strawberry',
        name: 'Ribbon Strawberry',
        image: IMG('ribbon-strawberry'),
        blurb: 'Fresh strawberries wrapped in a satin ribbon finish.',
      },
    ],
  },
  {
    slug: 'extra-special',
    name: 'Extra Special',
    shortName: 'Extra Special',
    tagline: 'Our most ambitious flavors, for moments that call for more.',
    sizes: [
      { code: 'S', inches: 10, price: 15 },
      { code: 'M', inches: 14, price: 20 },
      { code: 'L', inches: 20, price: 25 },
    ],
    flavors: [
      {
        slug: 'chocolate-dubai',
        name: 'Chocolate Dubai',
        image: IMG('chocolate-dubai'),
        blurb: 'Pistachio-kunafa cream between dense layers of dark chocolate.',
      },
      {
        slug: 'cacao-seeds',
        name: 'Cacao Seeds',
        image: IMG('cacao-seeds'),
        blurb: 'Naked chocolate layers, cocoa nibs, and a crown of dark berries.',
      },
      {
        slug: 'purple-velvet',
        name: 'Purple Velvet',
        image: IMG('purple-velvet'),
        blurb: 'Our red velvet, reimagined in a deep violet naked finish.',
      },
      {
        slug: 'tutti-frutti',
        name: 'Tutti Frutti',
        image: IMG('tutti-frutti'),
        blurb: 'A blush pink wrap around bright, fruit-forward layers.',
      },
    ],
  },
  {
    slug: 'tiramisu',
    name: 'Tiramisu',
    shortName: 'Tiramisu',
    tagline: 'Espresso-soaked ladyfingers, the Italian way.',
    sizes: [
      { code: 'S', inches: 10, price: 15 },
      { code: 'M', inches: 14, price: 20 },
      { code: 'L', inches: 20, price: 25 },
    ],
    flavors: [
      {
        slug: 'tiramisu-hero',
        name: 'Tiramisu Classic',
        image: IMG('tiramisu-hero'),
        blurb: 'Ladyfingers wrapped in gold ribbon, dusted with cocoa.',
      },
      {
        slug: 'tiramisu-cream',
        name: 'Tiramisu Supreme',
        image: IMG('tiramisu-cream'),
        blurb: 'Mascarpone cream, cocoa crumble, and a soft espresso soak.',
      },
    ],
  },
];

export type SignatureCake = {
  categorySlug: string;
  flavorSlug: string;
};

// Curated for the homepage showcase — one flavor per line, drawn from real
// categories so switching "flavor" inside the product modal stays truthful
// to the actual menu instead of faking options that don't exist.
export const signatureCakes: SignatureCake[] = [
  { categorySlug: 'regular-vanilla', flavorSlug: 'strawberry-dream' },
  { categorySlug: 'special', flavorSlug: 'red-velvet' },
  { categorySlug: 'regular-chocolate', flavorSlug: 'blackforest' },
  { categorySlug: 'special-vanilla', flavorSlug: 'pistachio-royale' },
  { categorySlug: 'extra-special', flavorSlug: 'chocolate-dubai' },
  { categorySlug: 'special-vanilla', flavorSlug: 'lotus-cream' },
  { categorySlug: 'extra-special', flavorSlug: 'purple-velvet' },
  { categorySlug: 'tiramisu', flavorSlug: 'tiramisu-hero' },
];

export function getCategory(slug: string): Category {
  const category = categories.find((c) => c.slug === slug);
  if (!category) throw new Error(`Unknown category: ${slug}`);
  return category;
}

export function getFlavor(categorySlug: string, flavorSlug: string): Flavor {
  const category = getCategory(categorySlug);
  const flavor = category.flavors.find((f) => f.slug === flavorSlug);
  if (!flavor) throw new Error(`Unknown flavor: ${flavorSlug} in ${categorySlug}`);
  return flavor;
}

export function priceFrom(category: Category): number {
  return Math.min(...category.sizes.map((s) => s.price));
}

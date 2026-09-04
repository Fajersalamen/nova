import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Exact palette from the restaurant's approved reference design
        // (converted from its OKLCH tokens) — not a generic default.
        brand: {
          400: '#e6474a',
          500: '#d9302f',
          600: '#d21718',
          700: '#ac1314',
          900: '#5f0a0b',
        },
        accent: {
          400: '#fdd137',
          500: '#dfb830',
          900: '#411e0d',
        },
        secondary: {
          600: '#174eba',
          700: '#134099',
        },
        cream: {
          DEFAULT: '#fbf3df',
          100: '#fdf9ef',
          200: '#ede5d8',
        },
        ink: {
          DEFAULT: '#1e1613',
          800: '#211815',
        },
        open: '#43c251',
        // Frankies Cake (standalone luxury site under /frankies-cake) —
        // namespaced so these never collide with the tokens above.
        fc: {
          cream: '#FBF4EA',
          'cream-dark': '#F1E6D3',
          paper: '#FFFDF8',
          cocoa: '#3A2A20',
          'cocoa-light': '#6B5140',
          blush: '#D9A594',
          gold: '#BD9457',
          sage: '#93A388',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'var(--font-sans)', 'sans-serif'],
        'fc-serif': ['var(--font-fc-serif)', 'ui-serif', 'serif'],
        'fc-sans': ['var(--font-fc-sans)', 'ui-sans-serif', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;

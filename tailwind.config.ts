import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7f2',
          100: '#e6ede1',
          200: '#c9dabc',
          300: '#a3c090',
          400: '#7aa165',
          500: '#5a8245',
          600: '#456634',
          700: '#37512a',
          800: '#2e4224',
          900: '#28381f',
        },
      },
    },
  },
  plugins: [],
};

export default config;

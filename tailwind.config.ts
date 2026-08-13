import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // Warm red/orange scale — brand-neutral default tuned for the
        // restaurant vertical (matches the red/orange signage most
        // Jordanian food brands already use), swap per-tenant via
        // theme_settings later if needed.
        brand: {
          50: '#fef2f0',
          100: '#fde3de',
          200: '#fbc7bd',
          300: '#f7a394',
          400: '#f2735d',
          500: '#e8432a',
          600: '#cc2e17',
          700: '#a82412',
          800: '#841d10',
          900: '#5e150c',
        },
        accent: {
          400: '#ffb020',
          500: '#f59e0b',
          600: '#d97706',
        },
      },
    },
  },
  plugins: [],
};

export default config;

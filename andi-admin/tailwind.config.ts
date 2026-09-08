import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#0F5132",
        brandDark: "#0B3D26",
      },
    },
  },
  plugins: [],
} satisfies Config;

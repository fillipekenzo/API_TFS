import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#004F9F",  // Azul semelhante ao do Bootstrap
        secondary: "#2085eb", // Cinza para elementos secundários
        verde: "#4CAF4F",  // Azul semelhante ao do Bootstrap
        verde500: "#39853b",  // Azul semelhante ao do Bootstrap
      },
    },
  },
  plugins: [],
} satisfies Config;

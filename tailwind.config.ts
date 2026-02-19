import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        background: "#0a0a0a",
        surface: "#141414",
        surfaceHover: "#1f1f1f",
        primary: "#ff006e",
        primaryHover: "#d90061",
        text: "#ffffff",
        textSecondary: "#b3b3b3",
      },
    },
  },
  plugins: [],
};
export default config;

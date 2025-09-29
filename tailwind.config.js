/** @type {import('tailwindcss').Config} */
module.exports = {
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
        // Transpayra brand colors
        'brand-primary': '#F0DFC8',    // Light cream/beige
        'brand-secondary': '#795833',  // Brown
        'brand-accent': '#795833',     // Same as secondary for consistency
      },
    },
  },
  plugins: [],
};
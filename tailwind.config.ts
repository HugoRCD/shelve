import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layout/**/*.vue",
    "./pages/**/*.vue",
    "./nuxt.config.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary-color)",
        accent: "var(--accent-color)",
      },
      textColor: {
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
        inverted: "var(--text-inverted)",
        accent: "var(--accent-color)",
      },
      borderColor: {
        main: "var(--border-color)",
      },
      fontFamily: {
        newsreader: ["Newsreader", "serif"],
        cabinet: ["Cabinet Grotesk Variable", "sans-serif"],
        geist: ["Geist", "sans-serif"],
      }
    },
  },
  plugins: [
  ],
} satisfies Config;

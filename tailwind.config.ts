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
        "primary-hover": "var(--primary-hover-color)",
        secondary: "var(--secondary-color)",
        "secondary-hover": "var(--secondary-hover-color)",
        accent: "var(--accent-color)",
        "accent-light": "var(--accent-light-color)",
        "accent-hover": "var(--accent-hover-color)",
        inverted: "var(--inverted-color)",
        "inverted-hover": "var(--inverted-hover-color)",
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
        geist: ["Geist", "sans-serif"],
      }
    },
  },
  plugins: [
  ],
} satisfies Config;

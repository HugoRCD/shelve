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
    },
  },
  plugins: [
  ],
} satisfies Config;

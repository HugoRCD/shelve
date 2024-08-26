import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layout/**/*.vue',
    './pages/**/*.vue',
    './nuxt.config.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          '50': '#ebf6ff',
          '100': '#dbedff',
          '200': '#bedeff',
          '300': '#97c6ff',
          '400': '#4c7eff',
          '500': '#2853ff',
          '600': '#2853ff',
          '700': '#2043e2',
          '800': '#1d3bb6',
          '900': '#20388f',
          '950': '#131f53',
        }
      },
      textColor: {
        secondary: 'var(--text-secondary)',
        tertiary: 'var(--text-tertiary)',
        inverted: 'var(--text-inverted)',
        accent: 'var(--accent-color)',
      },
      borderColor: {
        main: 'var(--border-color)',
      },
      fontFamily: {
        newsreader: ['Newsreader'],
        inter: ['Inter'],
        geist: ['Geist'],
      }
    },
  },
} satisfies Config

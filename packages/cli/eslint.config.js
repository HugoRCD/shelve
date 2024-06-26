import { createConfig } from "@hrcd/eslint-config"

export default createConfig({
  vue: {
    enable: false,
  },
  nuxt: {
    enable: false,
  },
  tailwind: {
    enable: true,
  },
  typescript: {
    strict: true,
  }
})

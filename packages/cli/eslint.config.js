import { createConfig } from "@hrcd/eslint-config"

export default createConfig({
  vue: {
    enable: false,
  },
  nuxt: {
    enable: false,
  },
  tailwind: {
    enable: false,
  },
  typescript: {
    strict: true,
  },
  features: {
    jsdoc: {
      enable: true,
      strict: true,
    }
  }
})

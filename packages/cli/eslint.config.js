import { createConfig } from "@hrcd/eslint-config"

export default createConfig({
  vue: {
    enabled: false,
  },
  nuxt: {
    enabled: false,
  },
  tailwind: {
    enabled: false,
  },
  typescript: {
    strict: true,
    any: true,
  },
  features: {
    packageJson: {
      enabled: true,
      strict: true,
    },
  }
})

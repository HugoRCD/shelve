import { createConfig } from "@hrcd/eslint-config"

export default createConfig({
  typescript: {
    strict: true
  },
  features: {
    jsdoc: {
      enable: true,
      strict: true
    }
  }
})

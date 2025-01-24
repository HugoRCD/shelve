import { createConfig } from "@hrcd/eslint-config"

export default createConfig({
  features: {
    packageJson: {
      enabled: false
    }
  }
})

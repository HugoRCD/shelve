import { loadConfig, watchConfig } from 'c12'

export async function showConfig() {
  const { config } = await loadConfig({
    name: 'shelve',
    packageJson: true,
    defaultConfig: {
      token: process.env.SHELVE_TOKEN,
      url: process.env.SHELVE_URL || 'https://shelve.hrcd.fr',
    },
  })
  console.log(config)
}

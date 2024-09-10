import { loadConfig } from 'c12'

export async function showConfig() {
  const { config, configFile } = await loadConfig({
    name: 'shelve',
    packageJson: true,
    defaultConfig: {
      token: process.env.SHELVE_TOKEN,
      url: process.env.SHELVE_URL || 'https://shelve.hrcd.fr',
    },
    dotenv: true,
  })
  console.log(config)
  console.log(configFile)
}

type ShelveConfig = {
  token: string
  url: string
}

export async function defineShelveConfig(config: ShelveConfig) {
  const { configFile } = await loadConfig({
    name: 'shelve',
    packageJson: true,
    defaultConfig: config,
    dotenv: true,
  })

  return configFile
}

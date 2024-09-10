import { loadConfig, setupDotenv } from 'c12'
import consola from 'consola'

export type ShelveConfig = {
  /**
   * The project name
   * */
  project: string
  /**
   * The token to authenticate with Shelve created using the app (https://shelve.hrcd.fr/app/tokens) or your own Shelve instance
   *
   * @default process.env.SHELVE_TOKEN
   * */
  token: string
  /**
   * The URL of the Shelve instance can be overridden with the `SHELVE_URL` environment variable
   *
   * @default https://shelve.hrcd.fr
   * @fallback process.env.SHELVE_URL
   * */
  url: string
  /**
   * Whether to confirm changes before pushing them to Shelve
   *
   * @default false
   * */
  confirmChanges: boolean
}

export async function loadShelveConfig(): Promise<ShelveConfig> {
  await setupDotenv({})

  const { config } = await loadConfig<ShelveConfig>({
    name: 'shelve',
    packageJson: true,
    rcFile: false,
    globalRc: false,
    dotenv: true,
    defaults: {
      project: process.env.SHELVE_PROJECT,
      token: process.env.SHELVE_TOKEN,
      url: process.env.SHELVE_URL || 'https://shelve.hrcd.fr',
      confirmChanges: false
    }
  })

  if (!config.project) {
    consola.error('Please provide a project name')
    process.exit(0)
  }

  // TODO: check provide URL

  if (!config.token) {
    consola.error('You need to provide a token')
    process.exit(0)
  }

  return config
}

export function createShelveConfig(config: ShelveConfig): ShelveConfig {
  if (!config.project) {
    consola.error('Please provide a project name')
    process.exit(1)
  }
  if (config.token) {
    consola.warn('Avoid using the token option, use the SHELVE_TOKEN environment variable instead for security reasons')
  }
  return config
}

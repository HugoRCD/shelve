import { loadConfig } from 'c12'

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

const getDefaultConfig = () => <ShelveConfig>({
  project: process.env.SHELVE_PROJECT,
  token: process.env.SHELVE_TOKEN,
  url: process.env.SHELVE_URL || 'https://shelve.hrcd.fr',
  confirmChanges: false
})

export async function loadShelveConfig(): Promise<ShelveConfig> {
  const defaults = getDefaultConfig()

  const { config } = await loadConfig<ShelveConfig>({
    name: 'shelve',
    packageJson: true,
    rcFile: false,
    globalRc: false,
    defaults,
    dotenv: true
  })

  return config
}

export function createShelveConfig(config: ShelveConfig): ShelveConfig {
  if (!config.project) {
    console.error('Please provide a project name')
    process.exit(1)
  }
  if (config.token) {
    console.warn('Avoid using the token option, use the SHELVE_TOKEN environment variable instead')
  }
  return config
}

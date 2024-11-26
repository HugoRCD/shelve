import type { EnvVar } from './Variables'
import type { Environment } from './Environment'

export const SHELVE_JSON_SCHEMA = 'https://raw.githubusercontent.com/HugoRCD/shelve/main/packages/types/shelve-config-schema.json'
export const DEFAULT_URL = 'https://app.shelve.cloud'

export type ShelveConfig = {
  /**
   * The project name
   *
   * @default process.env.SHELVE_PROJECT || nearest package.json name
   * */
  project: string
  /**
   * The team ID
   *
   * @default process.env.SHELVE_TEAM_ID || Your private team will be used
   */
  teamId?: number
  /**
   * The token to authenticate with Shelve created using the app (https://app.shelve.cloud/tokens) or your own Shelve instance
   *
   * @default process.env.SHELVE_TOKEN
   * */
  token: string
  /**
   * The URL of the Shelve instance can be overridden with the `SHELVE_URL` environment variable
   *
   * @default https://app.shelve.cloud
   * @fallback process.env.SHELVE_URL
   * */
  url: string
  /**
   * Whether to confirm changes before pushing them to Shelve or updating the .env file (locally)
   *
   * @default false
   * */
  confirmChanges: boolean
  /**
   * Name of your env file
   *
   * @default '.env'
   * */
  envFileName: string
  /**
   * Automatically uppercase the keys of the variables
   *
   * @default true
   * */
  autoUppercase: boolean
}

export type CreateEnvFileInput = {
  /**
   * Name of your env file
   *
   * @default '.env'
   * */
  envFileName: string
  /**
   * The variables to create in the .env file
   * */
  variables: EnvVar[]
  /**
   * Whether to confirm changes before updating the .env file
   *
   * @default false
   */
  confirmChanges: boolean
}

export type PushEnvFileInput = {
  /**
   * The variables to push to Shelve
   * */
  variables: EnvVar[]
  /**
   * The project ID
   * */
  projectId: number
  /**
   * The environment to push the variables to
   * */
  environment: Environment
  /**
   * Whether to confirm changes before pushing the variables to Shelve
   *
   * @default false
   */
  confirmChanges: boolean
  /**
   * Automatically uppercase the keys of the variables
   *
   * @default true
   * */
  autoUppercase: boolean
}

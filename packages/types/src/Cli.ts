import type { EnvVar } from './Variables'
import type { Environment } from './Environment'
import { Project } from './Project'

export const SHELVE_JSON_SCHEMA = 'https://raw.githubusercontent.com/HugoRCD/shelve/main/packages/types/schema.json'
export const DEFAULT_URL = 'https://app.shelve.cloud'

export type ShelveConfig = {
  /**
   * The project name
   *
   * @default process.env.SHELVE_PROJECT || nearest package.json name
   * */
  project: string
  /**
   * The team slug, you can find it your team's settings page
   *
   * @default process.env.SHELVE_TEAM_SLUG
   */
  slug: string
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
  /**
   * Automatically create the project if it doesn't exist
   *
   * @default true
   * */
  autoCreateProject: boolean
  /**
   * The monorepo configuration
   * */
  monorepo?: {
    paths: string[]
  }
  /**
   * The workspace directory
   * */
  workspaceDir: string
  /**
   * Whether the project is a monorepo
   * */
  isMonoRepo: boolean
  /**
   * Whether the project is at the root level
   * */
  isRoot: boolean
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
   * The project to push the variables to
   * */
  project: Project
  /**
   * The team slug, you can find it your team's settings page
   */
  slug: string
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

export type GetEnvVariables = {
  project: Project
  environmentId: number
  slug: string
}

export type CreateShelveConfigInput = {
  slug?: string
  projectName?: string
}

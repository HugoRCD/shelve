/**
 * @fileoverview Configuration management for Shelve CLI
 * This file handles the creation, loading, and validation of Shelve configuration.
 *
 * Configuration Priority (from highest to lowest):
 * 1. Environment variables (SHELVE_*)
 * 2. Local shelve.json (in current directory)
 * 3. Root shelve.json (in monorepo root)
 * 4. User configuration (~/.shelve)
 * 5. Default values
 *
 * The configuration is built progressively using defu, meaning each level can
 * override the values from lower priority sources. This allows for flexible
 * configuration management where:
 * - Local config can override root config (in monorepos)
 * - Environment variables can override any file-based config
 * - Each project in a monorepo can have its own specific settings while sharing common settings
 */

import { dirname, join } from 'path'
import { setupDotenv } from 'c12'
import { findWorkspaceDir, readPackageJSON } from 'pkg-types'
import { glob } from 'tinyglobby'
import defu from 'defu'
import type { CreateShelveConfigInput, ShelveConfig } from '@types'
import { DEFAULT_URL, SHELVE_JSON_SCHEMA } from '@types'
import { CredentialsService, FileService, PkgService, ProjectService } from '../services'
import { DEFAULT_ENV_FILENAME } from '../constants'
import { BaseService } from '../services/base'
import { CliError } from '../services/api-error'
import { askSelect, askText, cliIntro, cliOutro, handleCancel, isNonInteractive } from '.'

export const CONFIG_FILENAMES = [
  'shelve.json',
  'shelve.config.json',
  '.shelverc.json',
] as const

export type ConfigFileName = (typeof CONFIG_FILENAMES)[number]
export const CONFIG_FILENAMES_ARRAY: string[] = [...CONFIG_FILENAMES]

/**
 * Finds the first existing configuration file from the list of possible filenames
 *
 * @param directory - Directory to search in (defaults to current directory)
 * @returns The path to the first found config file, or null if none exists
 */
export function findConfigFile(directory: string = process.cwd()): string | null {
  for (const filename of CONFIG_FILENAMES) {
    const path = join(directory, filename)
    if (FileService.exists(path)) {
      return path
    }
  }
  return null
}

/**
 * Creates a new configuration file with the preferred filename
 *
 * @param config - Configuration content to write
 * @param preferredFilename - Preferred filename (defaults to first in CONFIG_FILENAMES)
 * @returns The path to the created config file
 */
function createConfigFile(config: string, preferredFilename: ConfigFileName = CONFIG_FILENAMES[0]): string {
  FileService.write(preferredFilename, config)
  return preferredFilename
}

/**
 * Creates a Shelve configuration file (shelve.json)
 * This function is called when no configuration exists or when explicitly requested
 *
 * @param input - Optional initialization parameters for the configuration
 * @returns Promise<ShelveConfig> - The created configuration object
 *
 * Flow:
 * 1. Load default configuration from various sources
 * 2. Prompt user for team slug if not provided
 * 3. Prompt user to select a project if not specified
 * 4. Create shelve.json file with the configuration
 */
export async function createShelveConfig(input: CreateShelveConfigInput = {}): Promise<ShelveConfig> {
  if (isNonInteractive() && !input.slug && !input.projectName) {
    throw new CliError(
      'No shelve.json found in this directory.',
      'CONFIG_MISSING',
      undefined,
      'Create shelve.json or set SHELVE_TEAM_SLUG, SHELVE_PROJECT, and SHELVE_TOKEN.',
    )
  }

  cliIntro(input.projectName ? `Create configuration for ${ input.projectName }` : 'No configuration file found, create a new one')

  const defaultConfig = await getDefaultConfig()

  const slug = input.slug || defaultConfig.slug || await askText(
    'Enter the team slug:',
    'my-team-slug',
    undefined,
    'Set SHELVE_TEAM_SLUG or pass --slug.',
  )
  const projectName = input.projectName || defaultConfig.project || await selectProject(slug)

  if (!projectName) handleCancel('Error: no project selected')

  createConfigFile(JSON.stringify({
    $schema: SHELVE_JSON_SCHEMA,
    project: projectName.toLowerCase(),
    slug,
  }, null, 2))

  cliOutro('Configuration file created successfully')

  return defu({ project: projectName, slug }, defaultConfig)
}

/**
 * Prompts user to select a project from available projects for the given team slug
 *
 * @param slug - The team slug to fetch projects for
 * @returns Promise<string> - The selected project name
 */
async function selectProject(slug: string): Promise<string> {
  const projects = await ProjectService.getProjects(slug)
  return askSelect('Select the current project:', projects.map(({ name }) => ({
    value: name,
    label: name,
  })))
}

/**
 * Reads a configuration file without applying any defaults.
 *
 * Defaults must stay out until every file has been read: merging them in early
 * makes each file look like it sets every key, so a lower-priority file can
 * never contribute one. See loadShelveConfig for the ordering that depends on it.
 *
 * @param path - Path to the configuration file, or null when none was found
 * @returns The parsed configuration, empty when there is nothing to read
 */
function readConfigFile(path: string | null): Partial<ShelveConfig> {
  if (!path) return {}
  const raw = FileService.read(path).trim()
  return raw ? JSON.parse(raw) : {}
}

/**
 * Finds the workspace packages that carry their own Shelve configuration.
 *
 * These are the packages a root-level command fans out to. The workspace root
 * is left out: its config file holds the settings shared across packages, it
 * does not describe a project of its own.
 *
 * @param workspaceDir - Root of the monorepo
 * @returns Absolute directory paths, sorted, without duplicates
 */
async function findWorkspaceConfigDirs(workspaceDir: string): Promise<string[]> {
  const paths = await glob(CONFIG_FILENAMES_ARRAY.map((name) => `**/${name}`), {
    cwd: workspaceDir,
    absolute: true,
    ignore: ['**/node_modules/**'],
  })

  return [...new Set(paths.map((path) => dirname(path)))]
    .filter((dir) => dir !== workspaceDir)
    .sort()
}

/**
 * Generates base configuration by gathering information from multiple sources.
 * This serves as the foundation that other configuration sources will override.
 *
 * Sources (in order of application):
 * 1. Default values
 * 2. User configuration (~/.shelve)
 * 3. Package.json information
 * 4. Environment variables
 *
 * Note: This configuration can still be overridden by root and local shelve.json
 *
 * @returns Promise<ShelveConfig> - The base configuration object
 */
async function getDefaultConfig(): Promise<ShelveConfig> {
  await setupDotenv({})
  const { name } = await readPackageJSON().catch(() => ({ name: undefined }))
  const conf = CredentialsService.readMeta()
  const workspaceDir = await findWorkspaceDir().catch(() => process.cwd())
  const isMonoRepo = await new PkgService().isMonorepo()
  const url = process.env.SHELVE_URL || conf.url || 'https://app.shelve.cloud'
  const token = process.env.SHELVE_TOKEN
    || (await CredentialsService.readToken(url).catch(() => undefined))

  return {
    // @ts-expect-error to provide error message we let project be undefined
    project: process.env.SHELVE_PROJECT || name,
    // Overwritten by loadShelveConfig once the config files have been read
    projectFromConfig: Boolean(process.env.SHELVE_PROJECT),
    // @ts-expect-error to provide error message we let slug be undefined
    slug: process.env.SHELVE_TEAM_SLUG,
    // @ts-expect-error checked downstream when an authenticated request is made
    token,
    url,
    defaultEnv: process.env.SHELVE_DEFAULT_ENV,
    username: conf.username,
    email: conf.email,
    confirmChanges: false,
    envFileName: DEFAULT_ENV_FILENAME,
    autoUppercase: true,
    autoCreateProject: true,
    monorepo: isMonoRepo ? { paths: await findWorkspaceConfigDirs(workspaceDir) } : undefined,
    workspaceDir,
    isMonoRepo,
    isRoot: workspaceDir === process.cwd(),
  }
}

/**
 * Main configuration loader function
 * Handles the complete configuration loading process by progressively building
 * the configuration object from multiple sources.
 *
 * Loading Process (highest priority first, as defu applies it):
 * 1. Local shelve.json (in the current directory)
 * 2. Root shelve.json (in the monorepo root)
 * 3. Defaults — user config (~/.shelve), package.json, environment variables
 *
 * Defaults come last on purpose. They carry concrete values for keys such as
 * `envFileName` and `autoCreateProject`, so folding them into the local config
 * first would make every local file look like it set those keys, and the root
 * config could never contribute one.
 *
 * @param check - Whether to validate and potentially create new configuration
 * @returns Promise<ShelveConfig> - The complete, merged configuration
 */
export async function loadShelveConfig(check = false): Promise<ShelveConfig> {
  let localConfigPath = findConfigFile()

  if (!localConfigPath && check) {
    await createShelveConfig()
    localConfigPath = findConfigFile()
  }

  const defaultConfig = await getDefaultConfig()
  const localConfig = readConfigFile(localConfigPath)

  let rootConfig: Partial<ShelveConfig> = {}

  if (defaultConfig.isMonoRepo) {
    const rootConfigPath = await FileService.findFile(CONFIG_FILENAMES_ARRAY, {
      startingFrom: defaultConfig.workspaceDir,
      stopOnFirst: true,
    }).catch(() => null)

    // At the workspace root both lookups land on the same file
    if (rootConfigPath && rootConfigPath !== localConfigPath) rootConfig = readConfigFile(rootConfigPath)
  }

  // defu widens optional keys to `| null` across Partial sources; defaultConfig
  // is complete, so the merged object is a full ShelveConfig
  const config = defu(localConfig, rootConfig, defaultConfig) as ShelveConfig

  config.projectFromConfig = Boolean(process.env.SHELVE_PROJECT)
    || Boolean(localConfig.project)
    || Boolean(rootConfig.project)

  if (check) await validateConfig(config)

  return config
}

/**
 * Validates the configuration object
 * Checks for required fields and format validity:
 * - Authentication token
 * - Team slug
 * - Project name
 * - URL format (if custom URL is provided)
 *
 * @param config - The configuration object to validate
 * @throws Error - Will cancel the process if validation fails
 */
async function validateConfig(config: ShelveConfig): Promise<void> {
  if (!config.token) await BaseService.getToken()
  if (!config.slug) {
    if (isNonInteractive()) {
      throw new CliError(
        'Team slug is required.',
        'MISSING_SLUG',
        undefined,
        'Set slug in shelve.json or SHELVE_TEAM_SLUG.',
      )
    }
    handleCancel('You need to provide your team slug')
  }
  if (!config.project) {
    if (isNonInteractive()) {
      throw new CliError(
        'Project name is required.',
        'MISSING_PROJECT',
        undefined,
        'Set project in shelve.json or SHELVE_PROJECT.',
      )
    }
    handleCancel('Please provide a project name')
  }
  if (config.url !== DEFAULT_URL && !/^(http|https):\/\/[^ "]+$/.test(config.url)) {
    handleCancel('Please provide a valid url')
  }
}

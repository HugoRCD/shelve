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

import { intro, outro } from '@clack/prompts'
import { setupDotenv } from 'c12'
import { findFile, findWorkspaceDir, readPackageJSON } from 'pkg-types'
import type { ShelveConfig } from '@shelve/types'
import { CreateShelveConfigInput, DEFAULT_URL, SHELVE_JSON_SCHEMA } from '@shelve/types'
import { readUser } from 'rc9'
import defu from 'defu'
import { FileService, PkgService, ProjectService } from '../services'
import { DEFAULT_ENV_FILENAME } from '../constants'
import { BaseService } from '../services/base'
import { askSelect, askText } from './prompt'
import { handleCancel } from '.'

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
  intro(input.projectName ? `Create configuration for ${ input.projectName }` : 'No configuration file found, create a new one')

  const defaultConfig = await getDefaultConfig()

  const slug = input.slug || defaultConfig.slug || await askText('Enter the team slug:', 'my-team-slug')
  const projectName = input.projectName || defaultConfig.project || await selectProject(slug)

  if (!projectName) handleCancel('Error: no project selected')

  const config = JSON.stringify({
    $schema: SHELVE_JSON_SCHEMA,
    project: projectName.toLowerCase(),
    slug,
  }, null, 2)

  FileService.write('shelve.json', config)
  outro('Configuration file created successfully')


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
 * Reads and merges configuration from a specific path with default configuration
 *
 * @param path - Path to the configuration file
 * @param isRoot - Whether this is the root configuration (for monorepos)
 * @returns Promise<ShelveConfig> - The merged configuration
 */
async function checkConfig(path: string | null, isRoot = false): Promise<ShelveConfig> {
  const defaultConfig = await getDefaultConfig()
  const config = path ? JSON.parse(FileService.read(path)) : null
  return isRoot ? config : defu(config, defaultConfig)
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
  // @ts-expect-error we don't want to specify 'cwd' option
  await setupDotenv({})
  const { name } = await readPackageJSON()
  const conf = readUser('.shelve')
  const workspaceDir = await findWorkspaceDir()
  const pkgService = new PkgService()
  const isMonoRepo = await pkgService.isMonorepo()
  const allPkg = await pkgService.getAllPackageJsons()

  return {
    // @ts-expect-error to provide error message we let project be undefined
    project: process.env.SHELVE_PROJECT || name,
    // @ts-expect-error to provide error message we let slug be undefined
    slug: process.env.SHELVE_TEAM_SLUG,
    token: conf.token,
    url: process.env.SHELVE_URL || 'https://app.shelve.cloud',
    username: conf.username,
    email: conf.email,
    confirmChanges: false,
    envFileName: DEFAULT_ENV_FILENAME,
    autoUppercase: true,
    monorepo: isMonoRepo ? { paths: allPkg.map(pkg => pkg.dir) } : undefined,
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
 * Loading Process:
 * 1. Start with default values
 * 2. Merge with user config (~/.shelve)
 * 3. If in monorepo, merge with root shelve.json
 * 4. Merge with local shelve.json (if exists)
 * 5. Apply environment variables (highest priority)
 *
 * This progressive merging ensures that more specific configurations
 * (local, env vars) can override more general ones (root, defaults).
 *
 * @param check - Whether to validate and potentially create new configuration
 * @returns Promise<ShelveConfig> - The complete, merged configuration
 */
export async function loadShelveConfig(check = false): Promise<ShelveConfig> {
  const isLocalConfigExist = FileService.exists('shelve.json')
  let localConfig = isLocalConfigExist ? await checkConfig('shelve.json') :
    check ? await createShelveConfig() : await getDefaultConfig()

  if (localConfig.isMonoRepo) {
    const rootConfigPath = await findFile('shelve.json', { startingFrom: localConfig.workspaceDir }).catch(() => null)
    const rootConfig = await checkConfig(rootConfigPath, true)
    localConfig = defu(localConfig, rootConfig)
  }

  if (check) await validateConfig(localConfig)

  return localConfig
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
  if (!config.slug) handleCancel('You need to provide your team slug')
  if (!config.project) handleCancel('Please provide a project name')
  if (config.url !== DEFAULT_URL && !/^(http|https):\/\/[^ "]+$/.test(config.url)) {
    handleCancel('Please provide a valid url')
  }
}

/**
 * @fileoverview Configuration management for Shelve CLI
 * This file handles the creation, loading, and validation of Shelve configuration.
 *
 * Configuration Priority (from highest to lowest):
 * 1. Local shelve.json (in the current directory)
 * 2. Environment variables (SHELVE_*)
 * 3. Root shelve.json (in a monorepo) — shared settings only, `project` is
 *    per-package and is never inherited from the root
 * 4. Static defaults — user configuration (~/.shelve), package.json, hardcoded values
 *
 * The configuration is built progressively using defu, meaning each level can
 * override the values from lower priority sources. This allows for flexible
 * configuration management where:
 * - The local file always wins, since that is what an operator is looking at
 * - Environment variables override a committed root config, so CI can override
 *   a repo's shelve.json without editing it
 * - Each project in a monorepo can have its own specific settings while sharing
 *   common settings from the root
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

  // At a monorepo root with no fan-out targets, defaultConfig.project falls back to
  // the root package.json name (a turborepo root always has one), so this would
  // silently auto-create a project nobody asked for (issue #712). Skip that name
  // fallback here so the prompt below runs instead. An explicit SHELVE_PROJECT is
  // still honored — only the package.json-name inference is skipped.
  const isMonorepoRootWithoutFanOut = defaultConfig.isMonoRepo
    && defaultConfig.isRoot
    && (defaultConfig.monorepo?.paths.length ?? 0) === 0
  const projectFallback = isMonorepoRootWithoutFanOut ? process.env.SHELVE_PROJECT : defaultConfig.project
  const projectName = input.projectName || projectFallback || await selectProject(slug)

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
    // Heuristic ignore list, not a real parse of the workspace's own globs
    // (package.json "workspaces" / pnpm-workspace.yaml). Extend this list, or
    // switch to parsing those globs, if phantom fan-out targets keep showing up.
    ignore: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.output/**',
      '**/.nuxt/**',
      '**/.next/**',
      '**/coverage/**',
    ],
  })

  return [...new Set(paths.map((path) => dirname(path)))]
    .filter((dir) => dir !== workspaceDir)
    .sort()
}

/**
 * Config keys sourced from environment variables, as their own defu layer.
 *
 * Kept separate from the rest of the static defaults so loadShelveConfig can
 * slot them in above a committed root shelve.json: a CI-provided SHELVE_* var
 * must not be silently overridden by a file checked into the repo (see the
 * priority note on loadShelveConfig). Only variables that are actually set are
 * included — an absent key lets the root config or the static defaults fill
 * the gap instead of being shadowed by `undefined`.
 *
 * Must be called after `setupDotenv` has run, so a var coming from a `.env`
 * file is already in `process.env` by the time this reads it.
 *
 * @returns The env-backed config keys that are currently set
 */
function getEnvOverrides(): Partial<ShelveConfig> {
  const overrides: Partial<ShelveConfig> = {}
  if (process.env.SHELVE_PROJECT) overrides.project = process.env.SHELVE_PROJECT
  if (process.env.SHELVE_TEAM_SLUG) overrides.slug = process.env.SHELVE_TEAM_SLUG
  if (process.env.SHELVE_URL) overrides.url = process.env.SHELVE_URL
  if (process.env.SHELVE_DEFAULT_ENV) overrides.defaultEnv = process.env.SHELVE_DEFAULT_ENV
  return overrides
}

/**
 * Memo for getDefaultConfig, keyed on process.cwd(). BaseService.getApi() now calls
 * loadShelveConfig on every HTTP request (so it can detect a url/token change across
 * a monorepo fan-out), and getDefaultConfig is the expensive part of that: setupDotenv,
 * a package.json read, an OS keychain read, and PkgService.isMonorepo's repo-wide
 * `**\/package.json` glob. Without this, all four re-run on every request to every
 * package.
 *
 * Only getDefaultConfig is cached, not loadShelveConfig as a whole. Local and root
 * shelve.json are read fresh on every loadShelveConfig call regardless (see
 * readConfigFile below), and getEnvOverrides is called a second time there too, above
 * defaultConfig in the defu merge — so a SHELVE_PROJECT/SHELVE_TEAM_SLUG/SHELVE_URL/
 * SHELVE_DEFAULT_ENV change always comes through live even from a cached entry. That
 * also means createShelveConfig's write-then-reread (in loadShelveConfig, below) never
 * touches this cache: it writes shelve.json, not package.json or the keychain.
 *
 * SHELVE_TOKEN is the one input read only here and nowhere else, so it can't fall out
 * of a stale entry the way the others do — see clearConfigCache and its call sites in
 * runInWorkspaces (workspaces.ts).
 */
const defaultConfigCache = new Map<string, ShelveConfig>()

/**
 * Drops every cached getDefaultConfig result. Needed wherever process.env or the
 * files getDefaultConfig reads (package.json, a .env file, the credentials store)
 * can change without process.cwd() also changing — otherwise a stale entry survives.
 * runInWorkspaces calls this next to its own process.env reset on each fan-out
 * iteration; tests that rewrite those files at a cwd they already queried need the
 * same call before querying it again.
 */
export function clearConfigCache(): void {
  defaultConfigCache.clear()
}

/**
 * Whether a command run in `config`'s directory should fan out to per-package
 * configs instead of running once: a monorepo root, that hasn't itself declared
 * a project, with at least one package carrying its own Shelve config.
 *
 * Shared by loadShelveConfig below (checked once against the pre-merge
 * defaultConfig, again against the fully merged config) and getWorkspaceTargets
 * (workspaces.ts), so the three copies this used to be can't drift apart on
 * what "will fan out" means.
 *
 * @param config - A ShelveConfig; either the pre-file-merge defaultConfig or
 *   the fully merged config both carry the fields this checks
 * @returns Whether fan-out targets exist for a per-package run
 */
export function willFanOut(config: ShelveConfig): boolean {
  return config.isMonoRepo
    && config.isRoot
    && !config.projectFromConfig
    && (config.monorepo?.paths.length ?? 0) > 0
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
  const cwd = process.cwd()
  const cached = defaultConfigCache.get(cwd)
  if (cached) return cached

  await setupDotenv({})
  const env = getEnvOverrides()
  const { name } = await readPackageJSON().catch(() => ({ name: undefined }))
  const conf = CredentialsService.readMeta()
  const workspaceDir = await findWorkspaceDir().catch(() => process.cwd())
  const isMonoRepo = await new PkgService().isMonorepo()
  const isRoot = workspaceDir === process.cwd()
  const url = env.url || conf.url || 'https://app.shelve.cloud'
  const token = process.env.SHELVE_TOKEN
    || (await CredentialsService.readToken(url).catch(() => undefined))

  const config: ShelveConfig = {
    // @ts-expect-error to provide error message we let project be undefined
    project: env.project || name,
    // Overwritten by loadShelveConfig once the config files have been read
    projectFromConfig: Boolean(env.project),
    // @ts-expect-error to provide error message we let slug be undefined
    slug: env.slug,
    // @ts-expect-error checked downstream when an authenticated request is made
    token,
    url,
    defaultEnv: env.defaultEnv,
    username: conf.username,
    email: conf.email,
    confirmChanges: false,
    envFileName: DEFAULT_ENV_FILENAME,
    autoUppercase: true,
    autoCreateProject: true,
    // Repo-wide glob, so only run it at the workspace root: monorepo.paths has one
    // reader (getWorkspaceTargets) and it's already guarded behind isRoot there.
    // A fan-out run would otherwise re-scan the whole repo once per package.
    monorepo: isMonoRepo ? { paths: isRoot ? await findWorkspaceConfigDirs(workspaceDir) : [] } : undefined,
    workspaceDir,
    isMonoRepo,
    isRoot,
  }

  defaultConfigCache.set(cwd, config)
  return config
}

/**
 * Main configuration loader function
 * Handles the complete configuration loading process by progressively building
 * the configuration object from multiple sources.
 *
 * Loading Process (highest priority first, as defu applies it):
 * 1. Local shelve.json (in the current directory)
 * 2. Environment variables (SHELVE_*)
 * 3. Root shelve.json (in the monorepo root), shared settings only —
 *    `project` is excluded, see the note below
 * 4. Static defaults — user config (~/.shelve), package.json, hardcoded values
 *
 * Env vars sit above the root config on purpose: a committed root shelve.json
 * must not silently override a CI-provided SHELVE_* var. They sit below the
 * local file so a value an operator can see in the current directory always wins.
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
  const defaultConfig = await getDefaultConfig()

  // A monorepo root with its own fan-out targets and no local shelve.json yet has
  // nothing of its own to create: `createShelveConfig` would write one at the root
  // using the root package.json name and permanently disable the fan-out (issue
  // #712). `defaultConfig.projectFromConfig` only reflects SHELVE_PROJECT here — a
  // root-declared `project` hasn't been read yet, but that's fine: this gate only
  // runs when there is no local shelve.json to declare one.
  const isFirstRunAtFanOutRoot = willFanOut(defaultConfig)

  let localConfigPath = findConfigFile()

  if (!localConfigPath && check && !isFirstRunAtFanOutRoot) {
    await createShelveConfig()
    localConfigPath = findConfigFile()
  }

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

  // `project` is per-package identity, not a shared setting: a root-declared
  // project must not leak into packages that fan out from it (issue #712-style
  // reports). The root's own project still works — at the workspace root
  // `rootConfig` stays `{}` (see above) and the value arrives through `localConfig`.
  const { project: _rootProject, ...sharedRootConfig } = rootConfig

  // defu widens optional keys to `| null` across Partial sources; defaultConfig
  // is complete, so the merged object is a full ShelveConfig
  const config = defu(localConfig, getEnvOverrides(), sharedRootConfig, defaultConfig) as ShelveConfig

  config.projectFromConfig = Boolean(process.env.SHELVE_PROJECT) || Boolean(localConfig.project)

  // Mirrors getWorkspaceTargets (workspaces.ts): skip validation only when this
  // run actually fans out to per-package configs instead of running once here.
  // Unlike isFirstRunAtFanOutRoot above, this checks the post-merge config, so a
  // root that declares its own project (read into localConfig by now) is still
  // validated instead of silently skipped.
  if (check && !willFanOut(config)) await validateConfig(config)

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

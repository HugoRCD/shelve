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

export async function createShelveConfig(input: CreateShelveConfigInput = {}): Promise<ShelveConfig> {
  intro(input.projectName ? `Create configuration for ${input.projectName}` : 'No configuration file found, create a new one')

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

async function selectProject(slug: string): Promise<string> {
  const projects = await ProjectService.getProjects(slug)
  return askSelect('Select the current project:', projects.map(({ name }) => ({
    value: name,
    label: name,
  })))
}

async function checkConfig(path: string | null, isRoot = false): Promise<ShelveConfig> {
  const defaultConfig = await getDefaultConfig()
  const config = path ? JSON.parse(FileService.read(path)) : null
  return isRoot ? config : defu(config, defaultConfig)
}

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

async function validateConfig(config: ShelveConfig): Promise<void> {
  if (!config.token) await BaseService.getToken()
  if (!config.slug) handleCancel('You need to provide your team slug')
  if (!config.project) handleCancel('Please provide a project name')
  if (config.url !== DEFAULT_URL && !/^(http|https):\/\/[^ "]+$/.test(config.url)) {
    handleCancel('Please provide a valid url')
  }
}

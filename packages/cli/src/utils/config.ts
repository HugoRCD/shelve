import { intro, outro } from '@clack/prompts'
import { setupDotenv } from 'c12'
import { findFile, findWorkspaceDir, readPackageJSON } from 'pkg-types'
import type { Project, ShelveConfig } from '@shelve/types'
import { CreateShelveConfigInput, DEFAULT_URL, SHELVE_JSON_SCHEMA } from '@shelve/types'
import { readUser } from 'rc9'
import defu from 'defu'
import { FileService, PkgService, ProjectService } from '../services'
import { DEFAULT_ENV_FILENAME } from '../constants'
import { BaseService } from '../services/base'
import { askSelect, askText } from './prompt'
import { handleCancel } from '.'

export async function createShelveConfig(input: CreateShelveConfigInput = {}): Promise<{ project: string, slug: string }> {
  intro(input.projectName ? `Create configuration for ${input.projectName}` : 'No configuration file found, create a new one')

  let project = input.projectName
  let projects: Project[] = []

  if (!input.slug) input.slug = await askText('Enter the team slug:', 'my-team-slug')

  if (!input.projectName) {
    projects = await ProjectService.getProjects(input.slug)

    project = await askSelect('Select the current project:', projects.map(project => ({
      value: project.name,
      label: project.name
    })))
  }

  if (!project) handleCancel('Error: no project selected')

  const config = JSON.stringify({
    $schema: SHELVE_JSON_SCHEMA,
    project: project.toLowerCase(),
    slug: input.slug,
  }, null, 2)

  FileService.write('shelve.json', config)

  outro('Configuration file created successfully')

  return {
    project,
    slug: input.slug
  }
}

async function checkConfig(path: string | null, isRoot: boolean = false): Promise<ShelveConfig> {
  const defaultConfig = await getDefaultConfig()
  let config = path ? JSON.parse(FileService.read(path)) : null

  if (!isRoot)
    config = defu(config, defaultConfig)

  return config
}

async function getDefaultConfig(): Promise<ShelveConfig> {
  // @ts-expect-error we don't want to specify 'cwd' option
  await setupDotenv({})

  const { name } = await readPackageJSON()

  const conf = readUser('.shelve')

  const workspaceDir = await findWorkspaceDir()
  const isMonoRepo = await new PkgService().isMonorepo()
  const isRoot = workspaceDir === process.cwd()
  const allPkg = await new PkgService().getAllPackageJsons()

  const monorepo = {
    paths: allPkg.map(pkg => pkg.dir),
  }

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
    monorepo: isMonoRepo ? monorepo : undefined,
    workspaceDir,
    isMonoRepo,
    isRoot
  }
}

export async function loadShelveConfig(check: boolean = false): Promise<ShelveConfig> {
  const localConfigPath = await findFile('shelve.json').catch(() => null)

  let localConfig

  if (!localConfigPath)
    localConfig = await createShelveConfig()

  localConfig = await checkConfig(localConfigPath)

  let finalConfig = localConfig

  if (localConfig.isMonoRepo) {
    const rootConfigPath = await findFile('shelve.json', { startingFrom: localConfig.workspaceDir })
      .catch(() => null)

    const rootConfig = await checkConfig(rootConfigPath, true)

    finalConfig = defu(localConfig, rootConfig)
  }

  if (check) {
    if (!finalConfig.token) await BaseService.getToken()

    if (!finalConfig.slug) handleCancel('You need to provide your team slug')

    if (!finalConfig.project) handleCancel('Please provide a project name')

    const urlRegex = /^(http|https):\/\/[^ "]+$/
    if (finalConfig.url !== DEFAULT_URL && !urlRegex.test(finalConfig.url)) {
      handleCancel('Please provide a valid url')
    }
  }

  return finalConfig
}

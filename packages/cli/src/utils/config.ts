import { cancel, intro, isCancel, outro, select, confirm } from '@clack/prompts'
import { loadConfig, setupDotenv } from 'c12'
import consola from 'consola'
import { ShelveConfig } from '../types'
import { getProjects } from './project'

async function createShelveConfig(): Promise<ShelveConfig> {
  intro('No configuration file found, creating one')

  const projects = await getProjects()

  const project = await select({
    message: 'Select the project:',
    options: projects.map(project => ({
      value: project.name,
      label: project.name
    })),
  })
  if (isCancel(project)) {
    cancel('Operation cancelled.')
    process.exit(0)
  }

  outro('Configuration file created successfully')
}

export async function getConfig(): Promise<ShelveConfig> {
  const { config, configFile } = await loadConfig<ShelveConfig>({
    name: 'shelve',
    packageJson: false,
    rcFile: false,
    globalRc: false,
    dotenv: true,
    defaults: {
      project: process.env.SHELVE_PROJECT,
      token: process.env.SHELVE_TOKEN,
      url: process.env.SHELVE_URL || 'https://shelve.hrcd.fr',
      confirmChanges: false,
      pullMethod: 'overwrite',
      pushMethod: 'overwrite',
      envFileName: '.env',
    }
  })
  return {
    config,
    configFile,
  }
}

export async function loadShelveConfig(): Promise<ShelveConfig> {
  await setupDotenv({})

  const { config, configFile } = await getConfig()

  if (configFile === 'shelve.config') {
    await createShelveConfig()
  }

  if (!config.project) {
    consola.error('Please provide a project name')
    process.exit(0)
  }

  const urlRegex = /^(http|https):\/\/[^ "]+$/
  if (!urlRegex.test(config.url)) {
    consola.error('Please provide a valid url')
    process.exit(0)
  }

  if (!config.token) {
    consola.error('You need to provide a token')
    process.exit(0)
  }

  return config
}

export function defineShelveConfig(config: ShelveConfig): ShelveConfig {
  if (!config.project) {
    consola.error('Please provide a project name')
    process.exit(1)
  }
  if (config.token) {
    consola.warn('Avoid using the token option, use the SHELVE_TOKEN environment variable instead for security reasons')
  }
  return config
}

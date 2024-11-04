import fs from 'fs'
import { intro, isCancel, outro, select } from '@clack/prompts'
import { loadConfig, setupDotenv, type ConfigLayer } from 'c12'
import consola from 'consola'
import { SHELVE_JSON_SCHEMA, type ShelveConfig } from '@shelve/types'
import { getProjects } from './project'
import { getKeyValue } from './env'
import { onCancel } from './index'

export async function createShelveConfig(projectName?: string): Promise<string> {
  intro(projectName ? `Create configuration for ${projectName}` : 'No configuration file found, create a new one')

  let project = projectName

  if (!projectName) {
    const projects = await getProjects()

    project = await select({
      message: 'Select the project:',
      options: projects.map(project => ({
        value: project.name,
        label: project.name
      })),
    }) as string
  }

  if (!project) onCancel('Error: no project selected')

  const configFile = JSON.stringify({
    $schema: SHELVE_JSON_SCHEMA,
    project: project.toLowerCase(),
  }
  , null,
  2)

  fs.writeFileSync('./shelve.config.json', configFile)

  if (isCancel(project)) onCancel('Operation cancelled.')

  outro('Configuration file created successfully')

  return project
}

export async function getConfig(): Promise<{
  config: ShelveConfig
} & ConfigLayer> {
  // @ts-expect-error we don't want to specify 'cwd' option
  await setupDotenv({})
  const { config, configFile } = await loadConfig<ShelveConfig>({
    name: 'shelve',
    packageJson: false,
    rcFile: false,
    globalRc: false,
    dotenv: true,
    defaults: {
      // @ts-expect-error to provide error message we let project be undefined
      project: process.env.SHELVE_PROJECT,
      // @ts-expect-error to provide error message we let token be undefined
      token: process.env.SHELVE_TOKEN,
      url: process.env.SHELVE_URL || 'https://app.shelve.cloud',
      confirmChanges: false,
      pullMethod: 'overwrite',
      pushMethod: 'overwrite',
      envFileName: '.env',
      autoUppercase: true,
    }
  })
  return {
    config,
    configFile,
  }
}

export async function loadShelveConfig(): Promise<ShelveConfig> {
  // @ts-expect-error we don't want to specify 'cwd' option
  await setupDotenv({})

  const { config, configFile } = await getConfig()

  if (configFile === 'shelve.config') {
    config.project = await createShelveConfig()
  }

  const envToken = await getKeyValue('SHELVE_TOKEN')
  if (envToken) config.token = envToken

  if (!config.token) {
    consola.error('You need to provide a token')
    process.exit(0)
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

  return config
}

export function defineShelveConfig(config: ShelveConfig): ShelveConfig {
  if (!config.project) {
    consola.error('Please provide a project name')
    process.exit(0)
  }
  if (config.token) {
    consola.warn('Avoid using the token option, use the SHELVE_TOKEN environment variable instead for security reasons')
  }
  return config
}

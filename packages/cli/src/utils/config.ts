import { intro, isCancel, outro, select } from '@clack/prompts'
import { loadConfig, setupDotenv } from 'c12'
import { readPackageJSON } from 'pkg-types'
import consola from 'consola'
import { DEFAULT_URL, SHELVE_JSON_SCHEMA } from '@shelve/types'
import type { Project, ShelveConfig } from '@shelve/types'
import { EnvService, FileService, ProjectService } from '../services'
import { handleCancel } from './error-handler'

export async function createShelveConfig(projectName?: string): Promise<string> {
  intro(projectName ? `Create configuration for ${projectName}` : 'No configuration file found, create a new one')

  let project = projectName
  let projects: Project[] = []

  if (!projectName) {
    projects = await ProjectService.getProjects()

    project = await select({
      message: 'Select the current project:',
      options: projects.map(project => ({
        value: project.name,
        label: project.name
      })),
    }) as string

    if (isCancel(project)) handleCancel('Operation cancelled.')
  }

  if (!project) handleCancel('Error: no project selected')

  const configFile = JSON.stringify({
    $schema: SHELVE_JSON_SCHEMA,
    project: project.toLowerCase(),
    teamId: projects.find(p => p.name === project)?.teamId
  }, null, 2)

  FileService.write('shelve.config.json', configFile)

  outro('Configuration file created successfully')

  return project
}

export async function loadShelveConfig(check: boolean = false): Promise<ShelveConfig> {
  // @ts-expect-error we don't want to specify 'cwd' option
  await setupDotenv({})

  const { name } = await readPackageJSON()
  /*const workspaceDir = await findWorkspaceDir()
  const isMonoRepo = await new PkgService().isMonorepo()
  const rootLevel = workspaceDir === process.cwd()*/

  const { config, configFile } = await loadConfig<ShelveConfig>({
    name: 'shelve',
    packageJson: true,
    rcFile: false,
    globalRc: false,
    dotenv: true,
    defaults: {
      // @ts-expect-error to provide error message we let project be undefined
      project: process.env.SHELVE_PROJECT || name,
      // @ts-expect-error to provide error message we let teamId be undefined
      teamId: +process.env.SHELVE_TEAM_ID,
      // @ts-expect-error to provide error message we let token be undefined
      token: process.env.SHELVE_TOKEN,
      url: process.env.SHELVE_URL || 'https://app.shelve.cloud',
      confirmChanges: false,
      envFileName: '.env',
      autoUppercase: true,
    },
  })

  /*const shelveConf = await findFile('shelve.json')
  console.log('shelveConf', shelveConf)*/

  if (check) {
    if (configFile === 'shelve.config') {
      config.project = await createShelveConfig()
    }

    const envToken = await EnvService.getKeyValue('SHELVE_TOKEN')
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
    if (config.url !== DEFAULT_URL && !urlRegex.test(config.url)) {
      consola.error('Please provide a valid url')
      process.exit(0)
    }
  }

  return config
}

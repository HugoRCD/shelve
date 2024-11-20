import fs from 'fs'
import { intro, isCancel, outro, select } from '@clack/prompts'
import { loadConfig, setupDotenv } from 'c12'
import { readPackageJSON } from 'pkg-types'
import consola from 'consola'
import { DEFAULT_URL, Project, SHELVE_JSON_SCHEMA, type ShelveConfig } from '@shelve/types'
import { getProjects } from './project'
import { getKeyValue } from './env'
import { onCancel } from './index'

export async function createShelveConfig(projectName?: string): Promise<string> {
  intro(projectName ? `Create configuration for ${projectName}` : 'No configuration file found, create a new one')

  let project = projectName
  let projects: Project[] = []

  if (!projectName) {
    projects = await getProjects()

    project = await select({
      message: 'Select the current project:',
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
    teamId: projects.find(p => p.name === project)?.teamId
  }
  , null,
  2)

  fs.writeFileSync('./shelve.config.json', configFile)

  if (isCancel(project)) onCancel('Operation cancelled.')

  outro('Configuration file created successfully')

  return project
}

export async function loadShelveConfig(check: boolean = true): Promise<ShelveConfig> {
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
      pullMethod: 'overwrite',
      pushMethod: 'overwrite',
      envFileName: '.env',
      autoUppercase: true,
    },
  })

  if (check) {
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
    if (config.url !== DEFAULT_URL && !urlRegex.test(config.url)) {
      consola.error('Please provide a valid url')
      process.exit(0)
    }
  }

  return config
}

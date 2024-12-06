import { intro, outro } from '@clack/prompts'
import { loadConfig, setupDotenv } from 'c12'
import { readPackageJSON } from 'pkg-types'
import { DEFAULT_URL, SHELVE_JSON_SCHEMA } from '@shelve/types'
import type { Project, ShelveConfig } from '@shelve/types'
import { FileService, ProjectService } from '../services'
import { DEFAULT_ENV_FILENAME } from '../constants'
import { askSelect, askText } from './prompt'
import { handleCancel } from '.'

export async function createShelveConfig(teamId?: string, projectName?: string): Promise<string> {
  intro(projectName ? `Create configuration for ${projectName}` : 'No configuration file found, create a new one')

  let project = projectName
  let projects: Project[] = []

  if (!teamId)
    teamId = await askText('Enter the team ID:', '1')

  if (!projectName) {
    projects = await ProjectService.getProjects(+teamId)

    project = await askSelect('Select the current project:', projects.map(project => ({
      value: project.name,
      label: project.name
    })))
  }

  if (!project) handleCancel('Error: no project selected')

  const configFile = JSON.stringify({
    $schema: SHELVE_JSON_SCHEMA,
    project: project.toLowerCase(),
    teamId: +teamId
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
      envFileName: DEFAULT_ENV_FILENAME,
      autoUppercase: true,
    },
  })

  /*const shelveConf = await findFile('shelve.json')
  console.log('shelveConf', shelveConf)*/

  if (check) {
    if (configFile === 'shelve.config')
      config.project = await createShelveConfig()

    if (!config.token) handleCancel('You need to provide a token')

    if (!config.teamId) handleCancel('You need to provide a team ID')

    if (!config.project) handleCancel('Please provide a project name')

    const urlRegex = /^(http|https):\/\/[^ "]+$/
    if (config.url !== DEFAULT_URL && !urlRegex.test(config.url)) {
      handleCancel('Please provide a valid url')
    }
  }

  return config
}

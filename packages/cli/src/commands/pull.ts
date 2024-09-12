import { cancel, intro, isCancel, spinner, outro, select } from '@clack/prompts'
import { Command } from 'commander'
import { loadShelveConfig } from '../utils/config'
import { useApi } from '../utils/api'
import { getProjectByName } from '../utils/project'
import { createEnvFile, getEnvVariables } from '../utils/env'

export function pullCommand(program: Command): void {
  program
    .command('pull')
    .description('Pull variables for specified environment to .env file')
    .action(async () => {
      const { project, pullMethod } = await loadShelveConfig()
      const api = await useApi()
      const s = spinner()

      intro(`Pulling variable from ${ project } project in ${ pullMethod } mode`)

      const environment = await select({
        message: 'Select the environment:',
        options: [
          { value: 'dev', label: 'Development' },
          { value: 'staging', label: 'Staging' },
          { value: 'prod', label: 'Production' },
        ],
      }) as string

      if (isCancel(environment)) {
        cancel('Operation cancelled.')
        process.exit(0)
      }

      try {
        const projectData = await getProjectByName(project)
        const variables = await getEnvVariables(projectData.id, environment)
        await createEnvFile(variables)
        outro(`Successfully pulled variable from ${environment} environment`)
      } catch (e) {
        cancel('Failed to fetch project')
        process.exit(0)
      }
    })
}

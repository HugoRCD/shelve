import { cancel, intro, isCancel, outro, select } from '@clack/prompts'
import { Command } from 'commander'
import { loadShelveConfig } from '../utils/config'
import { getProjectByName } from '../utils/project'
import { createEnvFile, getEnvVariables } from '../utils/env'

export function pullCommand(program: Command): void {
  program
    .command('pull')
    .description('Pull variables for specified environment to .env file')
    .action(async () => {
      const { project, pullMethod, envFileName } = await loadShelveConfig()

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

      const projectData = await getProjectByName(project)
      const variables = await getEnvVariables(projectData.id, environment)
      await createEnvFile(pullMethod, envFileName, variables)
      outro(`Successfully pulled variable from ${environment} environment`)
    })
}

import { intro, isCancel, outro, select } from '@clack/prompts'
import { Command } from 'commander'
import { loadShelveConfig } from '../utils/config'
import { getProjectByName } from '../utils/project'
import { createEnvFile, getEnvVariables } from '../utils/env'
import { onCancel } from '../utils'

export function pullCommand(program: Command): void {
  program
    .command('pull')
    .alias('pl')
    .description('Pull variables for specified environment to .env file')
    .option('-e, --environment <env>', 'Specify the environment (dev, staging, prod)')
    .action(async (options) => {
      const { project, pullMethod, envFileName, confirmChanges } = await loadShelveConfig()

      intro(`Pulling variable from ${project} project in ${pullMethod} mode`)

      let { environment } = options

      if (!environment) {
        environment = await select({
          message: 'Select the environment:',
          options: [
            { value: 'dev', label: 'Development' },
            { value: 'staging', label: 'Staging' },
            { value: 'prod', label: 'Production' },
          ],
        }) as string

        if (isCancel(environment)) onCancel('Operation cancelled.')
      } else {
        const validEnvironments = ['dev', 'staging', 'prod']
        if (!validEnvironments.includes(environment)) {
          onCancel(`Invalid environment: ${environment}. Valid options are: dev, staging, prod`)
        }
      }

      const projectData = await getProjectByName(project)
      const variables = await getEnvVariables(projectData.id, environment)
      await createEnvFile({ method: pullMethod, envFileName, variables, confirmChanges })
      outro(`Successfully pulled variable from ${environment} environment`)
      process.exit(0)
    })
}

import { intro, isCancel, outro, select } from '@clack/prompts'
import { Command } from 'commander'
import type { Environment } from '@shelve/types'
import { loadShelveConfig } from '../utils/config'
import { getProjectByName } from '../utils/project'
import { getEnvFile, pushEnvFile } from '../utils/env'
import { onCancel } from '../utils'

export function pushCommand(program: Command): void {
  program
    .command('push')
    .alias('ps')
    .description('Push variables for specified environment to Shelve')
    .option('-e, --environment <env>', 'Specify the environment (dev, staging, prod)')
    .action(async (options) => {
      const { project, pushMethod } = await loadShelveConfig()

      intro(`Pushing variable to ${project} project in ${pushMethod} method`)

      let environment = options.environment as Environment | undefined

      if (!environment) {
        environment = await select({
          message: 'Select the environment:',
          options: [
            { value: 'dev', label: 'Development' },
            { value: 'staging', label: 'Staging' },
            { value: 'prod', label: 'Production' },
          ],
        }) as Environment

        if (isCancel(environment)) onCancel('Operation cancelled.')
      } else {
        // Validate the provided environment
        const validEnvironments: Environment[] = ['dev', 'staging', 'prod']
        if (!validEnvironments.includes(environment)) {
          onCancel(`Invalid environment: ${environment}. Valid options are: dev, staging, prod`)
        }
      }

      const projectData = await getProjectByName(project)
      const variables = await getEnvFile()
      await pushEnvFile(variables, projectData.id, environment)
      outro(`Successfully pushed variable to ${environment} environment`)
    })
}

import { intro, isCancel, outro, select } from '@clack/prompts'
import { Command } from 'commander'
import { EnvType } from '@shelve/types'
import { loadShelveConfig } from '../utils/config'
import { getProjectByName } from '../utils/project'
import { getEnvFile, pushEnvFile } from '../utils/env'
import { onCancel } from '../utils'

export function pushCommand(program: Command): void {
  program
    .command('push')
    .alias('ps')
    .description('Push variables for specified environment to Shelve')
    .option('-e, --environment <env>', 'Specify the environment (development, preview, production)')
    .action(async (options) => {
      const { project, pushMethod, confirmChanges, autoUppercase } = await loadShelveConfig()

      intro(`Pushing variable to ${project} project in ${pushMethod} method`)

      let environment = options.environment as EnvType | undefined

      if (!environment) {
        environment = await select({
          message: 'Select the environment:',
          options: [
            { value: 'development', label: 'Development' },
            { value: 'preview', label: 'Preview' },
            { value: 'production', label: 'Production' },
          ],
        }) as EnvType

        if (isCancel(environment)) onCancel('Operation cancelled.')
      } else {
        const validEnvironments: EnvType[] = [EnvType.DEVELOPMENT, EnvType.PREVIEW, EnvType.PRODUCTION]
        if (!validEnvironments.includes(environment)) {
          onCancel(`Invalid environment: ${environment}. Valid options are: development, preview, production`)
        }
      }

      const projectData = await getProjectByName(project)
      const variables = await getEnvFile()
      await pushEnvFile({ variables, projectId: projectData.id, environment, confirmChanges, autoUppercase })
      outro(`Successfully pushed variable to ${environment} environment`)
      process.exit(0)
    })
}

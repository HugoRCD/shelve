import { intro, isCancel, outro, select } from '@clack/prompts'
import { Command } from 'commander'
import { EnvType } from '@shelve/types'
import { loadShelveConfig } from '../utils/config'
import { getProjectByName } from '../utils/project'
import { createEnvFile, getEnvVariables } from '../utils/env'
import { onCancel } from '../utils'

export function pullCommand(program: Command): void {
  program
    .command('pull')
    .alias('pl')
    .description('Pull variables for specified environment to .env file')
    .option('-e, --environment <env>', 'Specify the environment (development, preview, production)')
    .action(async (options) => {
      const { project, pullMethod, envFileName, confirmChanges } = await loadShelveConfig()

      intro(`Pulling variable from ${project} project in ${pullMethod} mode`)

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
      const variables = await getEnvVariables(projectData.id, environment)
      await createEnvFile({ method: pullMethod, envFileName, variables, confirmChanges })
      outro(`Successfully pulled variable from ${environment} environment`)
      process.exit(0)
    })
}

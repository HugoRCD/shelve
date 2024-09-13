import { cancel, intro, isCancel, outro, select } from '@clack/prompts'
import { Command } from 'commander'
import type { Environment } from '@shelve/types'
import { loadShelveConfig } from '../utils/config'
import { getProjectByName } from '../utils/project'
import { getEnvFile, pushEnvFile } from '../utils/env'

export function pushCommand(program: Command): void {
  program
    .command('push')
    .description('Push variables for specified environment to Shelve')
    .action(async () => {
      const { project, pushMethod } = await loadShelveConfig()

      intro(`Pushing variable to ${project} project in ${pushMethod} method`)

      const environment = await select({
        message: 'Select the environment:',
        options: [
          { value: 'dev', label: 'Development' },
          { value: 'staging', label: 'Staging' },
          { value: 'prod', label: 'Production' },
        ],
      }) as Environment

      if (isCancel(environment)) {
        cancel('Operation cancelled.')
        process.exit(0)
      }

      const projectData = await getProjectByName(project)
      const variables = await getEnvFile()
      await pushEnvFile(variables, projectData.id, environment)
      outro(`Successfully pushed variable to ${environment} environment`)
    })
}

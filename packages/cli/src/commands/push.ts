import { cancel, intro, isCancel, spinner, outro, select } from '@clack/prompts'
import { Command } from 'commander'
import { loadShelveConfig } from '../utils/config'
import { useApi } from '../utils/api'
import { getProjectByName } from '../utils/project'
import { createEnvFile } from '../utils/env'

export function pushCommand(program: Command): void {
  program
    .command('push')
    .description('Push variables for specified environment to Shelve')
    .action(async () => {
      const { project } = await loadShelveConfig()
      const api = await useApi()
      const s = spinner()

      intro('Pushing variable to Shelve')

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
        // TODO: validate env file
      } catch (e) {
        process.exit(0)
      }
    })
}

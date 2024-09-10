import { cancel, intro, isCancel, spinner, outro, select } from '@clack/prompts'
import { Command } from 'commander'
import { loadShelveConfig } from '../utils/config'
import { useApi } from '../utils/api'
import { getProjectByName } from '../utils/project'
import { createEnvFile } from '../utils/env'

export function pullCommand(program: Command): void {
  program
    .command('pull')
    .description('Pull variables from Shelve')
    .action(async () => {
      const { project } = await loadShelveConfig()
      const api = await useApi()
      const s = spinner()

      intro('Pulling variable from Shelve')

      const environment = await select({
        message: 'Select the environment:',
        options: [
          { value: 'dev', label: 'Development', hint: 'Development environment' },
          { value: 'staging', label: 'Staging' },
          { value: 'prod', label: 'Production' },
        ],
      }) as string

      if (isCancel(environment)) {
        cancel('Operation cancelled.')
        process.exit(0)
      }

      try {
        s.start('Fetching project')
        const projectData = await getProjectByName(project)
        const variables = await api(`/variable/${projectData.id}/${environment}`)
        s.stop('Fetching project')
        createEnvFile(variables)
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (e) {
        console.log(e)
      }
      outro(`Successfully pulled variable from ${environment} environment`)
    })
}

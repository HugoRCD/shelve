import { cancel, intro, isCancel, spinner, outro, select } from '@clack/prompts'
import { Command } from 'commander'
import type { VariablesCreateInput } from '@shelve/types'
import { loadShelveConfig } from '../utils/config'
import { useApi } from '../utils/api'
import { getProjectByName } from '../utils/project'
import { getEnvFile } from '../utils/env'

export function pushCommand(program: Command): void {
  program
    .command('push')
    .description('Push variables for specified environment to Shelve')
    .action(async () => {
      const { project, pushMethod } = await loadShelveConfig()
      const api = await useApi()
      const s = spinner()

      intro(`Pushing variable to ${project} project in ${pushMethod} method`)

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
        s.start('Pushing variable')
        const projectData = await getProjectByName(project)
        const variables = await getEnvFile()
        const body: VariablesCreateInput = {
          method: pushMethod,
          projectId: projectData.id,
          environment,
          variables: variables.map((variable) => ({
            key: variable.key,
            value: variable.value,
            projectId: projectData.id,
            environment
          }))
        }
        await api(`/variable`, { method: 'POST', body })
        s.stop('Pushing variable')
        outro(`Successfully pushed variable to ${environment} environment`)
      } catch (e) {
        cancel('Failed to fetch project')
        process.exit(0)
      }
    })
}

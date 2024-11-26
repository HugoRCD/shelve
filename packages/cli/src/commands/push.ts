import { intro, outro } from '@clack/prompts'
import { Command } from 'commander'
import { loadShelveConfig } from '../utils/config'
import { getProjectByName } from '../utils/project'
import { getEnvFile, pushEnvFile } from '../utils/env'
import { promptEnvironment } from '../utils/environment'

export function pushCommand(program: Command): void {
  program
    .command('push')
    .alias('ps')
    .description('Push variables for specified environment to Shelve')
    .option('-e, --environment <env>', 'Specify the environment (development, preview, production)')
    .action(async (options) => {
      const { project, teamId, confirmChanges, autoUppercase } = await loadShelveConfig()

      intro(`Pushing variable to ${project} project`)

      const environment = await promptEnvironment(teamId)

      const projectData = await getProjectByName(project)
      const variables = await getEnvFile()
      await pushEnvFile({ variables, projectId: projectData.id, environment, confirmChanges, autoUppercase })
      outro(`Successfully pushed variable to ${environment.name} environment`)
      process.exit(0)
    })
}

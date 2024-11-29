import { intro, outro } from '@clack/prompts'
import { Command } from 'commander'
import { loadShelveConfig } from '../utils/config'
import { promptEnvironment } from '../utils/environment'
import { EnvService, ProjectService } from '../services'

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

      const projectData = await ProjectService.getProjectByName(project)
      const variables = await EnvService.getEnvFile()
      await EnvService.pushEnvFile({ variables, projectId: projectData.id, environment, confirmChanges, autoUppercase })
      outro(`Successfully pushed variable to ${environment.name} environment`)
      process.exit(0)
    })
}

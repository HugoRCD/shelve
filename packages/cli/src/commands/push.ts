import { intro, outro } from '@clack/prompts'
import { Command } from 'commander'
import { loadShelveConfig } from '../utils'
import { EnvironmentService, EnvService, ProjectService } from '../services'

export function pushCommand(program: Command): void {
  program
    .command('push')
    .alias('ps')
    .description('Push variables for specified environment to Shelve')
    .option('-e, --environment <env>', 'Specify the environment (development, preview, production)')
    .action(async (options) => {
      const { project, slug, confirmChanges, autoUppercase, autoCreateProject } = await loadShelveConfig(true)

      intro(`Pushing variable to ${project} project`)

      const projectData = await ProjectService.getProjectByName(project, slug, autoCreateProject)

      const environment = await EnvironmentService.promptEnvironment(slug)
      const variables = await EnvService.getEnvFile()

      const pushed = await EnvService.pushEnvFile({ variables, project: projectData, environment, confirmChanges, autoUppercase, slug })

      if (pushed)
        outro(`Successfully pushed variable to ${environment.name} environment`)
      else
        outro('Variable push was cancelled')
    })
}

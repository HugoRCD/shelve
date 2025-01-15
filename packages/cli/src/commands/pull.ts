import { intro, outro, log } from '@clack/prompts'
import { Command } from 'commander'
import { loadShelveConfig } from '../utils'
import { EnvService, ProjectService, EnvironmentService } from '../services'

export function pullCommand(program: Command): void {
  program
    .command('pull')
    .alias('pl')
    .description('Pull variables for specified environment to .env file')
    .option('-e, --environment <env>', 'Specify the environment (development, preview, production)')
    .action(async (options) => {
      const { project, slug, envFileName, confirmChanges, autoCreateProject } = await loadShelveConfig(true)

      intro(`Pulling variable from ${project} project`)

      const projectData = await ProjectService.getProjectByName(project, slug, autoCreateProject)

      const environment = await EnvironmentService.promptEnvironment(slug)

      const variables = await EnvService.getEnvVariables({ project: projectData, environmentId: environment.id, slug })

      if (variables.length === 0)
        log.warn('No variables found in the specified environment')
      else
        await EnvService.createEnvFile({ envFileName, variables, confirmChanges })

      outro(`Successfully pulled variable from ${environment.name} environment`)
    })
}

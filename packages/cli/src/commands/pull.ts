import { intro, outro } from '@clack/prompts'
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
      const { project, teamId, envFileName, confirmChanges } = await loadShelveConfig(true)

      intro(`Pulling variable from ${project} project`)

      const projectData = await ProjectService.getProjectByName(project, teamId)

      const environment = await EnvironmentService.promptEnvironment(projectData)

      const variables = await EnvService.getEnvVariables(projectData, environment.id)

      if (variables.length === 0) {
        outro('No variables found')
      } else {
        await EnvService.createEnvFile({ envFileName, variables, confirmChanges })
      }

      outro(`Successfully pulled variable from ${environment.name} environment`)
    })
}

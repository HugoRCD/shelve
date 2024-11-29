import { intro, outro } from '@clack/prompts'
import { Command } from 'commander'
import { loadShelveConfig } from '../utils/config'
import { promptEnvironment } from '../utils/environment'
import { EnvService, ProjectService } from '../services'

export function pullCommand(program: Command): void {
  program
    .command('pull')
    .alias('pl')
    .description('Pull variables for specified environment to .env file')
    .option('-e, --environment <env>', 'Specify the environment (development, preview, production)')
    .action(async (options) => {
      const { project, teamId, envFileName, confirmChanges } = await loadShelveConfig()

      intro(`Pulling variable from ${project} project`)

      const environment = await promptEnvironment(teamId)

      const projectData = await ProjectService.getProjectByName(project)
      const variables = await EnvService.getEnvVariables(projectData.id, environment.id)
      await EnvService.createEnvFile({ envFileName, variables, confirmChanges })
      outro(`Successfully pulled variable from ${environment.name} environment`)
      process.exit(0)
    })
}

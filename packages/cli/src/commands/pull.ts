import { intro, outro } from '@clack/prompts'
import { Command } from 'commander'
import { loadShelveConfig } from '../utils/config'
import { getProjectByName } from '../utils/project'
import { createEnvFile, getEnvVariables } from '../utils/env'
import { promptEnvironment } from '../utils/environment'

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

      const projectData = await getProjectByName(project)
      const variables = await getEnvVariables(projectData.id, environment.id)
      await createEnvFile({ envFileName, variables, confirmChanges })
      outro(`Successfully pulled variable from ${environment.name} environment`)
      process.exit(0)
    })
}

import { intro, outro, log } from '@clack/prompts'
import { defineCommand } from 'citty'
import { loadShelveConfig } from '../utils'
import { EnvService, ProjectService, EnvironmentService } from '../services'

export default defineCommand({
  meta: {
    name: 'pull',
    description: 'Pull variables for specified environment to Shelve'
  },
  args: {
    env: {
      type: 'string',
      description: 'Specify the environment to which you want to pull the variables',
      required: false,
    },
  },
  async run({ args }) {
    const {
      project,
      slug,
      envFileName,
      confirmChanges,
      autoCreateProject,
      defaultEnv
    } = await loadShelveConfig(true)

    intro(`Pulling variable from ${project} project`)

    const projectData = await ProjectService.getProjectByName(project, slug, autoCreateProject)

    const env = args.env || defaultEnv

    const environment = await EnvironmentService.getEnvironment(slug, env)

    const variables = await EnvService.getEnvVariables({ project: projectData, environmentId: environment.id, slug })

    if (variables.length === 0)
      log.warn('No variables found in the specified environment')
    else
      await EnvService.createEnvFile({ envFileName, variables, confirmChanges })

    outro(`Successfully pulled variable from ${environment.name} environment`)
  }
})

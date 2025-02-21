import { intro, outro } from '@clack/prompts'
import { defineCommand } from 'citty'
import { loadShelveConfig } from '../utils'
import { EnvironmentService, EnvService, ProjectService } from '../services'

export default defineCommand({
  meta: {
    name: 'push',
    description: 'Push variables for specified environment to Shelve'
  },
  args: {
    environment: {
      type: 'string',
      description: 'Specify the environment to which you want to push the variables',
      required: false,
    },
  },
  async run({ args }) {
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
  }
})

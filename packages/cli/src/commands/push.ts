import { defineCommand } from 'citty'
import { loadShelveConfig, shouldSkipConfirm } from '../utils'
import { cliIntro, cliSuccess } from '../utils/output'
import { EnvService, ProjectService, EnvironmentService } from '../services'

export default defineCommand({
  meta: {
    name: 'push',
    description: 'Push variables for specified environment to Shelve',
  },
  args: {
    env: {
      type: 'string',
      description: 'Specify the environment to which you want to push the variables',
      required: false,
    },
    yes: {
      type: 'boolean',
      description: 'Skip confirmation prompts',
      required: false,
    },
  },
  async run({ args }) {
    const {
      project,
      slug,
      confirmChanges,
      autoUppercase,
      autoCreateProject,
      defaultEnv,
    } = await loadShelveConfig(true)

    const skipConfirm = args.yes || shouldSkipConfirm()
    const effectiveConfirmChanges = skipConfirm ? false : confirmChanges

    cliIntro(`Pushing variable to ${project} project`)

    const projectData = await ProjectService.getProjectByName(project, slug, autoCreateProject)

    const env = args.env || defaultEnv

    const environment = await EnvironmentService.getEnvironment(slug, env)
    const variables = await EnvService.getEnvFile()

    const pushed = await EnvService.pushEnvFile({
      variables,
      project: projectData,
      environment,
      confirmChanges: effectiveConfirmChanges,
      autoUppercase,
      slug,
    })

    if (pushed) {
      cliSuccess(
        { env: environment.name, variableCount: variables.length, pushed: true },
        `Successfully pushed variable to ${environment.name} environment`,
        'push',
      )
    } else {
      cliSuccess(
        { env: environment.name, variableCount: variables.length, pushed: false },
        'Variable push was cancelled',
        'push',
      )
    }
  },
})

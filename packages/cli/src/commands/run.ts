import { x } from 'tinyexec'
import { defineCommand } from 'citty'
import { intro } from '@clack/prompts'
import type { Environment, EnvVar } from '@types'
import consola from 'consola'
import { loadShelveConfig } from '../utils'
import { EnvironmentService, EnvService, ProjectService } from '../services'

export default defineCommand({
  meta: {
    name: 'run',
    description: '[experimental] Inject secrets from Shelve into your application process',
  },
  args: {
    command: {
      type: 'string',
      description: 'your application start command',
      required: true
    },
    env: {
      type: 'string',
      description: 'environment to use',
      required: false
    }
  },
  async run({ args }) {
    const { project, slug, autoCreateProject } = await loadShelveConfig(true)
    intro(`Pulling variables from ${project} project`)

    const projectData = await ProjectService.getProjectByName(project, slug, autoCreateProject)

    const environment: Environment = args.env
      ? await EnvironmentService.getEnvironment(args.env, slug)
      : await EnvironmentService.promptEnvironment(slug)

    const variables: EnvVar[] = await EnvService.getEnvVariables({
      project: projectData,
      environmentId: environment.id,
      slug
    })

    const processEnv = {
      ...process.env,
      ...formatEnvVars(variables)
    }

    try {
      const proc = x('nr', [args.command], {
        nodeOptions: {
          env: processEnv,
          stdio: 'inherit'
        }
      })

      const abortController = new AbortController()
      process.on('SIGINT', () => {
        consola.info('SIGINT received, aborting process')
        abortController.abort()
        proc.kill()
        process.exit(0)
      })

      await proc
    } catch (error) {
      process.exit(1)
    }
  }
})

function formatEnvVars(variables: EnvVar[]): NodeJS.ProcessEnv {
  return variables.reduce<NodeJS.ProcessEnv>((acc, { key, value }) => ({
    ...acc,
    [key]: value
  }), {})
}

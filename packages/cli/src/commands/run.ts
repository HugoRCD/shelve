import { spawn } from 'node:child_process'
import { defineCommand } from 'citty'
import { intro, outro } from '@clack/prompts'
import type { Environment, EnvVar } from '@types'
import { loadShelveConfig } from '../utils'
import { EnvironmentService, EnvService, ProjectService } from '../services'

export default defineCommand({
  meta: {
    name: 'run',
    description: 'Inject secrets from Shelve into your application process',
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
      outro(`Running command with ${environment.name} environment`)

      const childProcess = spawn(`nr ${args.command}`, {
        env: processEnv,
        stdio: 'inherit',
        shell: true,
        detached: false
      })

      process.on('SIGINT', () => {
        process.kill(-childProcess.pid!, 'SIGINT')
      })

      process.on('SIGTERM', () => {
        process.kill(-childProcess.pid!, 'SIGTERM')
      })

      childProcess.on('error', (error: any) => {
        console.error('Failed to start process:', error)
        cleanup(childProcess)
        process.exit(1)
      })

      childProcess.on('exit', (code: number | null, signal: string | null) => {
        if (signal) {
          cleanup(childProcess)
          process.exit(0)
        } else if (code !== 0) {
          console.error(`Process exited with code ${code}`)
          cleanup(childProcess)
          process.exit(code ?? 1)
        }
        cleanup(childProcess)
        process.exit(0)
      })
    } catch (error) {
      console.error('Error running command:', error)
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

function cleanup(childProcess: any): void {
  try {
    if (childProcess && !childProcess.killed) {
      process.kill(-childProcess.pid!, 'SIGKILL')
    }
  } catch (error) { /* empty */ }
}

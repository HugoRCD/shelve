import { resolve } from 'path'
import { x } from 'tinyexec'
import { defineCommand } from 'citty'
import { intro } from '@clack/prompts'
import type { EnvVar } from '@types'
import consola from 'consola'
import treeKill from 'tree-kill'
import { handleCancel, loadShelveConfig } from '../utils'
import { EnvironmentService, EnvService, ProjectService } from '../services'
import { DEBUG } from '../constants'

export default defineCommand({
  meta: {
    name: 'run',
    description: '[experimental] Inject secrets from Shelve into your application process',
  },
  args: {
    command: {
      type: 'string',
      description: 'your application start command',
      required: false
    },
    env: {
      type: 'string',
      description: 'environment to use',
      required: false
    }
  },
  async run({ args, rawArgs }) {
    const { project, slug, autoCreateProject, defaultEnv } = await loadShelveConfig(true)
    intro(`Pulling variables from ${project} project`)

    const projectData = await ProjectService.getProjectByName(project, slug, autoCreateProject)

    const env = args.env || defaultEnv

    const environment = await EnvironmentService.getEnvironment(slug, env)

    const variables: EnvVar[] = await EnvService.getEnvVariables({
      project: projectData,
      environmentId: environment.id,
      slug
    })

    const processEnv = {
      ...process.env,
      ...formatEnvVars(variables)
    }

    const command = args.command || rawArgs[0]
    if (!command) handleCancel('You must provide a command to run')

    try {
      const isNpx = getNrBinPath() === 'npx'

      let hasExited = false
      let exitTimeout: NodeJS.Timeout | null = null
      const childPid: number | null = null

      const cleanupAndExit = (code: number = 0): void => {
        if (hasExited) return
        hasExited = true

        if (exitTimeout) {
          clearTimeout(exitTimeout)
        }

        process.exit(code)
      }

      const handleSignal = (signal: string): void => {
        consola.info(`Received ${signal}, terminating process...`)

        if (childPid) {
          treeKill(childPid, signal, (err) => {
            if (err && DEBUG) consola.error(`Failed to kill process: ${err}`)
          })

          exitTimeout = setTimeout(() => {
            consola.warn('Process did not exit gracefully, forcing termination...')
            if (childPid) {
              treeKill(childPid, 'SIGKILL', () => {
                cleanupAndExit(1)
              })
            } else {
              cleanupAndExit(1)
            }
          }, 3000)
        } else {
          cleanupAndExit(0)
        }
      }

      ['SIGINT', 'SIGTERM', 'SIGHUP'].forEach(signal => {
        process.on(signal, () => handleSignal(signal))
      })

      const proc = x(
        getNrBinPath(),
        isNpx ? ['nr', command] : [command],
        {
          nodeOptions: {
            env: processEnv,
            stdio: 'inherit'
          }
        }
      )

      try {
        await proc
        cleanupAndExit(0)
      } catch (err) {
        if (DEBUG) consola.error(err)
        cleanupAndExit(1)
      }
    } catch (error) {
      if (DEBUG) consola.error(error)
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

function getNrBinPath(): string {
  try {
    return resolve(process.cwd(), 'node_modules/.bin/nr')
  } catch (error) {
    return 'npx'
  }
}

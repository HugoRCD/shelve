import { intro, outro, log, confirm, isCancel } from '@clack/prompts'
import { defineCommand } from 'citty'
import { detectAgent, handleCancel, loadShelveConfig } from '../utils'
import { EnvService, ProjectService, EnvironmentService } from '../services'

export default defineCommand({
  meta: {
    name: 'pull',
    description: 'Pull variables for specified environment to Shelve',
  },
  args: {
    env: {
      type: 'string',
      description: 'Specify the environment to which you want to pull the variables',
      required: false,
    },
    yes: {
      type: 'boolean',
      description: 'Skip the AI-agent disk-write confirmation prompt',
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
      defaultEnv,
    } = await loadShelveConfig(true)

    const agent = detectAgent()
    if (agent && !args.yes) {
      log.warn(
        `${agent} appears to be running in this shell. \`shelve pull\` writes plaintext secrets to ${envFileName} where AI agents can read them. Prefer \`shelve run -- <cmd>\` so secrets stay in memory.`
      )
      const proceed = await confirm({ message: 'Write secrets to disk anyway?', initialValue: false })
      if (isCancel(proceed) || !proceed) handleCancel('Aborted by user')
    }

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
  },
})

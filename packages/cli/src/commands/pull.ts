import { confirm, isCancel } from '@clack/prompts'
import { defineCommand } from 'citty'
import { isAgentShell, loadShelveConfig, shouldSkipConfirm } from '../utils'
import { cliCancel, cliError, cliIntro, cliSuccess, cliWarn } from '../utils/output'
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

    const skipConfirm = args.yes || shouldSkipConfirm()

    if (isAgentShell() && !skipConfirm) {
      cliError({
        code: 'AGENT_BLOCKED',
        message: `\`shelve pull\` writes plaintext secrets to ${envFileName} where AI agents can read them.`,
        hint: 'Prefer `shelve run -- <cmd>` so secrets stay in memory, or pass --yes to write secrets to disk anyway.',
      })
    }

    if (isAgentShell() && skipConfirm) {
      cliWarn(
        `${process.env.AI_AGENT || 'AI agent'} detected. Writing secrets to ${envFileName}. Prefer \`shelve run -- <cmd>\` when possible.`
      )
    } else if (!skipConfirm && !isAgentShell()) {
      const proceed = await confirm({ message: 'Write secrets to disk?', initialValue: false })
      if (isCancel(proceed) || !proceed) cliCancel('Aborted by user')
    }

    cliIntro(`Pulling variable from ${project} project`)

    const projectData = await ProjectService.getProjectByName(project, slug, autoCreateProject)

    const env = args.env || defaultEnv

    const environment = await EnvironmentService.getEnvironment(slug, env)

    const variables = await EnvService.getEnvVariables({ project: projectData, environmentId: environment.id, slug })

    const effectiveConfirmChanges = skipConfirm ? false : confirmChanges

    if (variables.length === 0) {
      cliWarn('No variables found in the specified environment')
    } else {
      await EnvService.createEnvFile({ envFileName, variables, confirmChanges: effectiveConfirmChanges })
    }

    cliSuccess(
      {
        env: environment.name,
        variableCount: variables.length,
        file: envFileName,
        keys: variables.map(v => v.key),
      },
      `Successfully pulled variable from ${environment.name} environment`,
      'pull',
    )
  },
})

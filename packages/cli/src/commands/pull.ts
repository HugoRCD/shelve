import { confirm, isCancel } from '@clack/prompts'
import { defineCommand } from 'citty'
import type { ShelveConfig } from '@types'
import { isAgentShell, loadShelveConfig, shouldSkipConfirm } from '../utils'
import { assertPullAllowed, getResolvedSyncPolicy } from '../utils/sync-policy'
import { getWorkspaceTargets, runFanOutCommand } from '../utils/workspaces'
import { cliCancel, cliError, cliIntro, cliOutro, cliWarn } from '../utils/output'
import { CliError } from '../services/api-error'
import { EnvService, ProjectService, EnvironmentService, SyncService } from '../services'

type PullResult = {
  env: string
  variableCount: number
  file: string
  keys: string[]
  pullMode: string
  preservedLocalKeys: string[]
}

async function pullProject(
  config: ShelveConfig,
  envArg: string | undefined,
  skipConfirm: boolean,
): Promise<PullResult> {
  const {
    project,
    slug,
    envFileName,
    confirmChanges,
    autoCreateProject,
    defaultEnv,
    autoUppercase,
    sync,
  } = config

  const env = envArg || defaultEnv
  if (!env) {
    throw new CliError(
      'Environment name is required.',
      'MISSING_ENV',
      undefined,
      'Pass --env or set defaultEnv in shelve.json / SHELVE_DEFAULT_ENV.',
    )
  }

  cliIntro(`Pulling variable from ${project} project`)

  const projectData = await ProjectService.getProjectByName(project, slug, autoCreateProject)
  const environment = await EnvironmentService.getEnvironment(slug, env)
  const policy = getResolvedSyncPolicy(environment.name, sync, projectData.syncPolicy)
  assertPullAllowed(policy, environment.name)

  const syncContext = await SyncService.loadSyncContext({
    project: projectData,
    environmentId: environment.id,
    environmentName: environment.name,
    slug,
    autoUppercase,
  })

  const variables = SyncService.mergeForPull(syncContext, autoUppercase)
  const effectiveConfirmChanges = skipConfirm ? false : (confirmChanges || policy.requireConfirmation)

  if (variables.length === 0) {
    cliWarn('No variables found in the specified environment')
  } else {
    await EnvService.createEnvFile({
      envFileName,
      variables,
      confirmChanges: effectiveConfirmChanges,
      pullMode: policy.pullMode,
    })
  }

  cliOutro(`Successfully pulled variable from ${environment.name} environment`)

  return {
    env: environment.name,
    variableCount: variables.length,
    file: envFileName,
    keys: variables.map(v => v.key),
    pullMode: policy.pullMode,
    preservedLocalKeys: policy.pullMode === 'merge' ? syncContext.diff.onlyLocal : [],
  }
}

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
    path: {
      type: 'string',
      description: 'Pull a single monorepo package instead of every one',
      required: false,
    },
    yes: {
      type: 'boolean',
      description: 'Skip the AI-agent disk-write confirmation prompt',
      required: false,
    },
  },
  async run({ args }) {
    const config = await loadShelveConfig(true)
    const { envFileName } = config

    const skipConfirm = args.yes || shouldSkipConfirm()

    // A fanned-out run writes each package's own envFileName, which can differ
    // from the root config's (see monorepo-config.test.ts). Naming the root's
    // filename here would point at a file this run may never write, so only
    // name it for a single-project run. Resolving targets doesn't touch disk,
    // so this can safely happen ahead of the write-confirmation guard below.
    const targets = getWorkspaceTargets(config, args.path)

    if (isAgentShell() && !skipConfirm) {
      cliError({
        code: 'AGENT_BLOCKED',
        message: targets
          ? '`shelve pull` writes plaintext secrets to each package\'s env file where AI agents can read them.'
          : `\`shelve pull\` writes plaintext secrets to ${envFileName} where AI agents can read them.`,
        hint: 'Prefer `shelve run -- <cmd>` so secrets stay in memory, or pass --yes to write secrets to disk anyway.',
      })
    }

    if (isAgentShell() && skipConfirm) {
      cliWarn(
        targets
          ? `${process.env.AI_AGENT || 'AI agent'} detected. Writing secrets to each package's env file. Prefer \`shelve run -- <cmd>\` when possible.`
          : `${process.env.AI_AGENT || 'AI agent'} detected. Writing secrets to ${envFileName}. Prefer \`shelve run -- <cmd>\` when possible.`
      )
    } else if (!skipConfirm && !isAgentShell()) {
      const proceed = await confirm({ message: 'Write secrets to disk?', initialValue: false })
      if (isCancel(proceed) || !proceed) cliCancel('Aborted by user')
    }

    await runFanOutCommand('pull', config, args.path, (cfg) => pullProject(cfg, args.env, skipConfirm))
  },
})

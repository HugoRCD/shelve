import { defineCommand } from 'citty'
import type { EnvDiffResult, PushEnvFileResult, ResolvedSyncPolicy, ShelveConfig } from '@types'
import { assertSyncConfirmationAllowed, loadShelveConfig, shouldSkipConfirm } from '../utils'
import { assertPullAllowed, assertPushAllowed, getResolvedSyncPolicy } from '../utils/sync-policy'
import { runFanOutCommand } from '../utils/workspaces'
import { cliIntro, cliOutro, cliWarn } from '../utils/output'
import { CliError } from '../services/api-error'
import { EnvService, EnvironmentService, ProjectService, SyncService } from '../services'

type SyncArgs = {
  env?: string
  dryRun: boolean
  skipConfirm: boolean
}

// Discriminated on `dryRun` first, then `action`: syncProject's three return sites
// (dry-run, push, pull) produce different shapes and nothing checked them before,
// so the --json contract for `sync` could drift silently. `action` is 'push' | 'pull'
// on the dry-run branch since it reports what *would* run without running it.
type SyncDryRunResult = {
  env: string
  action: 'push' | 'pull'
  policy: ResolvedSyncPolicy
  diff: EnvDiffResult
  dryRun: true
}

type SyncPushResult = PushEnvFileResult & {
  env: string
  action: 'push'
  dryRun?: false
}

type SyncPullResult = {
  env: string
  action: 'pull'
  dryRun?: false
  variableCount: number
  file?: string
  pullMode?: string
  keys?: string[]
}

type SyncResult = SyncDryRunResult | SyncPushResult | SyncPullResult

async function syncProject(config: ShelveConfig, args: SyncArgs): Promise<SyncResult> {
  const {
    project,
    slug,
    confirmChanges,
    autoUppercase,
    autoCreateProject,
    defaultEnv,
    sync,
    envFileName,
  } = config

  const env = args.env || defaultEnv
  if (!env) {
    throw new CliError(
      'Environment name is required.',
      'MISSING_ENV',
      undefined,
      'Pass --env or set defaultEnv in shelve.json / SHELVE_DEFAULT_ENV.',
    )
  }

  const projectData = await ProjectService.getProjectByName(project, slug, autoCreateProject)
  const environment = await EnvironmentService.getEnvironment(slug, env)
  const policy = getResolvedSyncPolicy(environment.name, sync, projectData.syncPolicy)

  const syncContext = await SyncService.loadSyncContext({
    project: projectData,
    environmentId: environment.id,
    environmentName: environment.name,
    slug,
    autoUppercase,
  })

  const action = policy.sourceOfTruth === 'local' ? 'push' : 'pull'

  cliIntro(args.dryRun
    ? `Sync dry-run (${action}) for ${environment.name}`
    : `Syncing (${action}) ${environment.name}`)

  if (args.dryRun) {
    cliOutro(`Would ${action} per sourceOfTruth: ${policy.sourceOfTruth}`)
    return {
      env: environment.name,
      action,
      policy,
      diff: syncContext.diff,
      dryRun: true,
    }
  }

  if (action === 'push') {
    assertPushAllowed(policy, environment.name)
    assertSyncConfirmationAllowed(
      confirmChanges,
      policy.requireConfirmation,
      args.skipConfirm,
      'Sync push confirmation is required.',
    )

    const { variables, skippedKeys, conflictKeys } = await SyncService.preparePushVariables(
      syncContext,
      autoUppercase,
      args.skipConfirm,
    )

    const pushResult = await EnvService.pushEnvFile({
      variables,
      project: projectData,
      environment,
      confirmChanges: args.skipConfirm ? false : (confirmChanges || policy.requireConfirmation),
      autoUppercase,
      slug,
      syncPolicy: policy,
    })

    cliOutro(pushResult.pushed ? 'Sync push complete' : 'Nothing to push')

    return { env: environment.name, action: 'push', ...pushResult, skippedKeys, conflictKeys }
  }

  assertPullAllowed(policy, environment.name)
  const variables = SyncService.mergeForPull(syncContext, autoUppercase)

  if (variables.length === 0) {
    cliWarn('No variables to pull')
    cliOutro('Nothing to pull')
    return { env: environment.name, action: 'pull', variableCount: 0 }
  }

  await EnvService.createEnvFile({
    envFileName,
    variables,
    confirmChanges: args.skipConfirm ? false : (confirmChanges || policy.requireConfirmation),
    pullMode: policy.pullMode,
  })

  cliOutro(`Sync pull complete for ${environment.name}`)

  return {
    env: environment.name,
    action: 'pull',
    variableCount: variables.length,
    file: envFileName,
    pullMode: policy.pullMode,
    keys: variables.map(v => v.key),
  }
}

export default defineCommand({
  meta: {
    name: 'sync',
    description: 'Apply sync policy (push or pull based on sourceOfTruth)',
  },
  args: {
    env: {
      type: 'string',
      description: 'Environment to sync',
      required: false,
    },
    path: {
      type: 'string',
      description: 'Sync a single monorepo package instead of every one',
      required: false,
    },
    'dry-run': {
      type: 'boolean',
      description: 'Show what would happen without writing',
      required: false,
    },
    yes: {
      type: 'boolean',
      description: 'Skip confirmation prompts',
      required: false,
    },
  },
  async run({ args }) {
    const config = await loadShelveConfig(true)
    const syncArgs: SyncArgs = {
      env: args.env,
      dryRun: Boolean(args['dry-run']),
      // citty doesn't inherit parent command args, so the global `shelve --yes sync`
      // never reaches `args.yes` here — shouldSkipConfirm() reads the global flag
      // directly, same as pull.ts, so --non-interactive alone still fails as designed.
      skipConfirm: Boolean(args.yes) || shouldSkipConfirm(),
    }
    await runFanOutCommand('sync', config, args.path, (cfg) => syncProject(cfg, syncArgs))
  },
})

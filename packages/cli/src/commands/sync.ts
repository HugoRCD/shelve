import { defineCommand } from 'citty'
import { assertSyncConfirmationAllowed, loadShelveConfig } from '../utils'
import { assertPullAllowed, assertPushAllowed, getResolvedSyncPolicy } from '../utils/sync-policy'
import { cliIntro, cliSuccess, cliWarn } from '../utils/output'
import { CliError } from '../services/api-error'
import { EnvService, EnvironmentService, ProjectService, SyncService } from '../services'

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
    const dryRun = Boolean(args['dry-run'])
    const skipConfirm = Boolean(args.yes)

    cliIntro(dryRun ? `Sync dry-run (${action}) for ${environment.name}` : `Syncing (${action}) ${environment.name}`)

    if (dryRun) {
      cliSuccess(
        {
          env: environment.name,
          action,
          policy,
          diff: syncContext.diff,
          dryRun: true,
        },
        `Would ${action} per sourceOfTruth: ${policy.sourceOfTruth}`,
        'sync',
      )
      return
    }

    if (action === 'push') {
      assertPushAllowed(policy, environment.name)
      assertSyncConfirmationAllowed(
        confirmChanges,
        policy.requireConfirmation,
        skipConfirm,
        'Sync push confirmation is required.',
      )

      const { variables, skippedKeys, conflictKeys } = await SyncService.preparePushVariables(
        syncContext,
        autoUppercase,
        skipConfirm,
      )

      const pushResult = await EnvService.pushEnvFile({
        variables,
        project: projectData,
        environment,
        confirmChanges: skipConfirm ? false : (confirmChanges || policy.requireConfirmation),
        autoUppercase,
        slug,
        syncPolicy: policy,
      })

      cliSuccess(
        { env: environment.name, action: 'push', ...pushResult, skippedKeys, conflictKeys },
        pushResult.pushed ? 'Sync push complete' : 'Nothing to push',
        'sync',
      )
      return
    }

    assertPullAllowed(policy, environment.name)
    const variables = SyncService.mergeForPull(syncContext, autoUppercase)
    if (variables.length === 0) {
      cliWarn('No variables to pull')
      cliSuccess({ env: environment.name, action: 'pull', variableCount: 0 }, 'Nothing to pull', 'sync')
      return
    }

    await EnvService.createEnvFile({
      envFileName,
      variables,
      confirmChanges: skipConfirm ? false : (confirmChanges || policy.requireConfirmation),
      pullMode: policy.pullMode,
    })

    cliSuccess(
      {
        env: environment.name,
        action: 'pull',
        variableCount: variables.length,
        file: envFileName,
        pullMode: policy.pullMode,
        keys: variables.map(v => v.key),
      },
      `Sync pull complete for ${environment.name}`,
      'sync',
    )
  },
})

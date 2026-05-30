import { defineCommand } from 'citty'
import { loadShelveConfig } from '../utils'
import { assertPushAllowed, getResolvedSyncPolicy } from '../utils/sync-policy'
import { isNonInteractive } from '../utils/cli-context'
import { cliIntro, cliSuccess, cliWarn } from '../utils/output'
import { CliError } from '../services/api-error'
import { EnvService, ProjectService, EnvironmentService, SyncService } from '../services'

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
      sync,
    } = await loadShelveConfig(true)

    const confirmed = Boolean(args.yes)
    const env = args.env || defaultEnv
    if (!env) {
      throw new CliError(
        'Environment name is required.',
        'MISSING_ENV',
        undefined,
        'Pass --env or set defaultEnv in shelve.json / SHELVE_DEFAULT_ENV.',
      )
    }

    cliIntro(`Pushing variable to ${project} project`)

    const projectData = await ProjectService.getProjectByName(project, slug, autoCreateProject)
    const environment = await EnvironmentService.getEnvironment(slug, env)
    const policy = getResolvedSyncPolicy(environment.name, sync, projectData.syncPolicy)
    assertPushAllowed(policy, environment.name)

    if ((confirmChanges || policy.requireConfirmation) && !confirmed && isNonInteractive()) {
      throw new CliError(
        'Push confirmation is required.',
        'CONFIRMATION_REQUIRED',
        undefined,
        'Pass --yes to confirm pushing variables in non-interactive mode.',
      )
    }
    const effectiveConfirmChanges = confirmed ? false : (confirmChanges || policy.requireConfirmation)

    const syncContext = await SyncService.loadSyncContext(
      projectData,
      environment.id,
      environment.name,
      slug,
      autoUppercase,
    )

    const { variables, skippedKeys, conflictKeys } = await SyncService.preparePushVariables(
      syncContext,
      autoUppercase,
      confirmed,
    )

    const result = await EnvService.pushEnvFile({
      variables,
      project: projectData,
      environment,
      confirmChanges: effectiveConfirmChanges,
      autoUppercase,
      slug,
      syncPolicy: policy,
    })

    result.skippedKeys = skippedKeys
    result.conflictKeys = conflictKeys

    if (skippedKeys.length > 0) {
      cliWarn(`Skipped ${skippedKeys.length} key(s): ${skippedKeys.join(', ')}`)
    }

    if (result.pushed) {
      cliSuccess(
        {
          env: environment.name,
          variableCount: result.variableCount,
          pushed: true,
          skippedKeys,
          conflictKeys,
        },
        `Successfully pushed variable to ${environment.name} environment`,
        'push',
      )
    } else {
      cliSuccess(
        {
          env: environment.name,
          variableCount: 0,
          pushed: false,
          skippedKeys,
          conflictKeys,
        },
        'Nothing to push',
        'push',
      )
    }
  },
})

import { defineCommand } from 'citty'
import type { ShelveConfig } from '@types'
import { loadShelveConfig, assertSyncConfirmationAllowed } from '../utils'
import { assertPushAllowed, getResolvedSyncPolicy } from '../utils/sync-policy'
import { getWorkspaceTargets, runInWorkspaces } from '../utils/workspaces'
import { cliIntro, cliOutro, cliSuccess, cliWarn } from '../utils/output'
import { CliError } from '../services/api-error'
import { EnvService, ProjectService, EnvironmentService, SyncService } from '../services'

type PushResult = {
  env: string
  variableCount: number
  pushed: boolean
  skippedKeys: string[]
  conflictKeys: string[]
}

async function pushProject(
  config: ShelveConfig,
  envArg: string | undefined,
  confirmed: boolean,
): Promise<PushResult> {
  const {
    project,
    slug,
    confirmChanges,
    autoUppercase,
    autoCreateProject,
    defaultEnv,
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

  cliIntro(`Pushing variable to ${project} project`)

  const projectData = await ProjectService.getProjectByName(project, slug, autoCreateProject)
  const environment = await EnvironmentService.getEnvironment(slug, env)
  const policy = getResolvedSyncPolicy(environment.name, sync, projectData.syncPolicy)
  assertPushAllowed(policy, environment.name)

  assertSyncConfirmationAllowed(
    confirmChanges,
    policy.requireConfirmation,
    confirmed,
    'Push confirmation is required.',
  )
  const effectiveConfirmChanges = confirmed ? false : (confirmChanges || policy.requireConfirmation)

  const syncContext = await SyncService.loadSyncContext({
    project: projectData,
    environmentId: environment.id,
    environmentName: environment.name,
    slug,
    autoUppercase,
  })

  const { variables, skippedKeys, conflictKeys } = await SyncService.preparePushVariables(
    syncContext,
    autoUppercase,
    confirmed,
  )

  const pushResult = await EnvService.pushEnvFile({
    variables,
    project: projectData,
    environment,
    confirmChanges: effectiveConfirmChanges,
    autoUppercase,
    slug,
    syncPolicy: policy,
  })

  if (skippedKeys.length > 0) {
    cliWarn(`Skipped ${skippedKeys.length} key(s): ${skippedKeys.join(', ')}`)
  }

  cliOutro(pushResult.pushed
    ? `Successfully pushed variable to ${environment.name} environment`
    : 'Nothing to push')

  return {
    env: environment.name,
    variableCount: pushResult.pushed ? pushResult.variableCount : 0,
    pushed: pushResult.pushed,
    skippedKeys,
    conflictKeys,
  }
}

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
    path: {
      type: 'string',
      description: 'Push a single monorepo package instead of every one',
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
    const confirmed = Boolean(args.yes)
    const targets = getWorkspaceTargets(config, args.path)

    if (!targets) {
      cliSuccess(await pushProject(config, args.env, confirmed), undefined, 'push')
      return
    }

    const packages = await runInWorkspaces(targets, async () =>
      pushProject(await loadShelveConfig(true), args.env, confirmed))

    cliSuccess(
      { packages },
      `Pushed ${packages.length} package(s): ${packages.map(p => p.path).join(', ')}`,
      'push',
    )
  },
})

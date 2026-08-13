import { defineCommand } from 'citty'
import type { ResolvedSyncPolicy, ShelveConfig } from '@types'
import { isJson, loadShelveConfig } from '../utils'
import { getResolvedSyncPolicy } from '../utils/sync-policy'
import { getWorkspaceTargets, runInWorkspaces } from '../utils/workspaces'
import { cliIntro, cliOutro, cliSuccess } from '../utils/output'
import { CliError } from '../services/api-error'
import { EnvironmentService, ProjectService, SyncService } from '../services'

type DiffResult = {
  env: string
  file: string
  policy: ResolvedSyncPolicy
  onlyLocal: string[]
  onlyRemote: string[]
  changed: string[]
  unchanged: string[]
}

function normalizeKey(key: string, autoUppercase: boolean): string {
  return autoUppercase ? key.toUpperCase() : key
}

async function diffProject(
  config: ShelveConfig,
  envArg: string | undefined,
  showValues: boolean,
): Promise<DiffResult> {
  const {
    project,
    slug,
    envFileName,
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

  cliIntro(`Diff local ${envFileName} vs ${env}`)

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

  const { diff } = syncContext
  const result: DiffResult = {
    env: environment.name,
    file: envFileName,
    policy,
    onlyLocal: diff.onlyLocal,
    onlyRemote: diff.onlyRemote,
    changed: diff.changed,
    unchanged: diff.unchanged,
  }

  if (isJson()) return result

  const lines = [
    `Environment: ${environment.name}`,
    `Source of truth (policy): ${policy.sourceOfTruth}`,
    `onPushConflict: ${policy.onPushConflict} · pullMode: ${policy.pullMode}`,
    `allowPush: ${policy.allowPush} · allowPull: ${policy.allowPull}`,
    '',
    `Only in ${envFileName} (${diff.onlyLocal.length}): ${diff.onlyLocal.join(', ') || '—'}`,
    `Only on Shelve (${diff.onlyRemote.length}): ${diff.onlyRemote.join(', ') || '—'}`,
    `Changed (${diff.changed.length}): ${diff.changed.join(', ') || '—'}`,
    `Unchanged (${diff.unchanged.length}): ${diff.unchanged.length} key(s)`,
  ]

  if (showValues && diff.changed.length > 0) {
    lines.push('', 'Changed values (local → remote):')
    const localMap = new Map(
      syncContext.local.map(v => [normalizeKey(v.key, autoUppercase), v.value]),
    )
    const remoteMap = new Map(
      syncContext.remote.map(v => [normalizeKey(v.key, autoUppercase), v.value]),
    )
    for (const key of diff.changed) {
      const lookup = normalizeKey(key, autoUppercase)
      lines.push(`  ${key}: ${localMap.get(lookup) ?? '?'} → ${remoteMap.get(lookup) ?? '?'}`)
    }
  }

  console.log(lines.join('\n'))
  cliOutro('Diff complete')

  return result
}

export default defineCommand({
  meta: {
    name: 'diff',
    description: 'Compare local env file with Shelve (no writes)',
  },
  args: {
    env: {
      type: 'string',
      description: 'Environment to compare against',
      required: false,
    },
    path: {
      type: 'string',
      description: 'Diff a single monorepo package instead of every one',
      required: false,
    },
    'show-values': {
      type: 'boolean',
      description: 'Include secret values in human output (never in JSON)',
      required: false,
    },
  },
  async run({ args }) {
    const config = await loadShelveConfig(true)
    const showValues = Boolean(args['show-values'])
    const targets = getWorkspaceTargets(config, args.path)

    if (!targets) {
      cliSuccess(await diffProject(config, args.env, showValues), undefined, 'diff')
      return
    }

    const packages = await runInWorkspaces(targets, async () =>
      diffProject(await loadShelveConfig(true), args.env, showValues))

    cliSuccess(
      { packages },
      `Diffed ${packages.length} package(s): ${packages.map(p => p.path).join(', ')}`,
      'diff',
    )
  },
})

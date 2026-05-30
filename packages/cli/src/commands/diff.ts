import { defineCommand } from 'citty'
import { isJson, loadShelveConfig } from '../utils'
import { getResolvedSyncPolicy } from '../utils/sync-policy'
import { cliIntro, cliSuccess } from '../utils/output'
import { CliError } from '../services/api-error'
import { EnvironmentService, ProjectService, SyncService } from '../services'

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
    'show-values': {
      type: 'boolean',
      description: 'Include secret values in human output (never in JSON)',
      required: false,
    },
  },
  async run({ args }) {
    const {
      project,
      slug,
      envFileName,
      autoCreateProject,
      defaultEnv,
      autoUppercase,
      sync,
    } = await loadShelveConfig(true)

    const env = args.env || defaultEnv
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

    const syncContext = await SyncService.loadSyncContext(
      projectData,
      environment.id,
      environment.name,
      slug,
      autoUppercase,
    )

    const { diff } = syncContext
    const data = {
      env: environment.name,
      file: envFileName,
      policy,
      onlyLocal: diff.onlyLocal,
      onlyRemote: diff.onlyRemote,
      changed: diff.changed,
      unchanged: diff.unchanged,
    }

    if (isJson()) {
      cliSuccess(data, undefined, 'diff')
      return
    }

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

    if (args['show-values'] && diff.changed.length > 0) {
      lines.push('', 'Changed values (local → remote):')
      const localMap = new Map(syncContext.local.map(v => [v.key.toUpperCase(), v.value]))
      const remoteMap = new Map(syncContext.remote.map(v => [v.key.toUpperCase(), v.value]))
      for (const key of diff.changed) {
        lines.push(`  ${key}: ${localMap.get(key) ?? '?'} → ${remoteMap.get(key) ?? '?'}`)
      }
    }

    console.log(lines.join('\n'))
    if (!isJson()) cliSuccess(undefined, 'Diff complete')
  },
})

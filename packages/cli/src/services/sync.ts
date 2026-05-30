import {
  diffEnvVars,
  excludeVarsByKeys,
  mergeEnvVarsForPull,
  type EnvDiffResult,
  type EnvVar,
  type EnvVarExport,
  type Project,
  type ResolvedSyncPolicy,
  type ShelveSyncConfig,
} from '@types'
import { CliError } from './api-error'
import { EnvService } from './env'
import { getResolvedSyncPolicy } from '../utils/sync-policy'
import { loadShelveConfig } from '../utils/config'
import { askBoolean, isNonInteractive, shouldSkipConfirm } from '../utils'
import { multiselect, isCancel } from '@clack/prompts'
import { cliCancel } from '../utils/output'

export type SyncContext = {
  policy: ResolvedSyncPolicy
  diff: EnvDiffResult
  local: EnvVar[]
  remote: EnvVarExport[]
}

export class SyncService {

  static resolvePolicy(
    environmentName: string,
    project?: Project,
    fileSync?: ShelveSyncConfig,
  ): ResolvedSyncPolicy {
    const configSync = fileSync ?? undefined
    return getResolvedSyncPolicy(environmentName, configSync, project?.syncPolicy)
  }

  static async loadSyncContext(
    project: Project,
    environmentId: number,
    environmentName: string,
    slug: string,
    autoUppercase: boolean,
  ): Promise<SyncContext> {
    const config = await loadShelveConfig()
    const policy = this.resolvePolicy(environmentName, project, config.sync)
    const local = await EnvService.getEnvFile()
    const remote = await EnvService.getEnvVariables({
      project,
      environmentId,
      slug,
      quiet: true,
    })
    const diff = diffEnvVars(local, remote, autoUppercase)
    return { policy, diff, local, remote }
  }

  static async preparePushVariables(
    context: SyncContext,
    autoUppercase: boolean,
    skipConfirm: boolean,
  ): Promise<{ variables: EnvVar[], skippedKeys: string[], conflictKeys: string[] }> {
    const { policy, diff, local } = context
    const conflictKeys = [...diff.changed]
    let variables = [...local]
    const skippedKeys: string[] = []

    if (conflictKeys.length === 0 || policy.onPushConflict === 'overwrite') {
      return { variables, skippedKeys, conflictKeys: [] }
    }

    const conflictSet = new Set(conflictKeys)

    if (policy.onPushConflict === 'fail') {
      throw new CliError(
        `Push blocked: ${conflictKeys.length} variable(s) differ on Shelve (${conflictKeys.join(', ')}).`,
        'SYNC_CONFLICT',
        undefined,
        'Run `shelve diff`, align values, or set sync.onPushConflict to overwrite/skip/prompt.',
      )
    }

    if (policy.onPushConflict === 'skip') {
      variables = excludeVarsByKeys(variables, conflictSet, autoUppercase)
      skippedKeys.push(...conflictKeys)
      return { variables, skippedKeys, conflictKeys }
    }

    // prompt
    if (skipConfirm || shouldSkipConfirm()) {
      variables = excludeVarsByKeys(variables, conflictSet, autoUppercase)
      skippedKeys.push(...conflictKeys)
      return { variables, skippedKeys, conflictKeys }
    }

    if (isNonInteractive()) {
      throw new CliError(
        `Push has ${conflictKeys.length} conflicting key(s) and onPushConflict is "prompt".`,
        'SYNC_CONFLICT',
        undefined,
        'Pass --yes to skip conflicting keys, or set onPushConflict to overwrite/fail/skip.',
      )
    }

    const selected = await multiselect({
      message: 'Select conflicting keys to push (unselected keys are skipped):',
      options: conflictKeys.map(key => ({ value: key, label: key })),
      required: false,
    })
    if (isCancel(selected)) cliCancel('Push cancelled.')

    const pushSet = new Set(selected as string[])
    const skipFromPrompt = conflictKeys.filter(k => !pushSet.has(k))
    variables = excludeVarsByKeys(variables, new Set(skipFromPrompt), autoUppercase)
    skippedKeys.push(...skipFromPrompt)

    return { variables, skippedKeys, conflictKeys }
  }

  static mergeForPull(
    context: SyncContext,
    autoUppercase: boolean,
  ): EnvVarExport[] {
    if (context.policy.pullMode === 'replace') {
      return context.remote
    }
    return mergeEnvVarsForPull(context.local, context.remote, autoUppercase)
  }

  static async confirmIfRequired(
    policy: ResolvedSyncPolicy,
    confirmChanges: boolean,
    skipConfirm: boolean,
    message: string,
  ): Promise<void> {
    const needsConfirm = (confirmChanges || policy.requireConfirmation) && !skipConfirm
    if (needsConfirm) await askBoolean(message)
  }

}

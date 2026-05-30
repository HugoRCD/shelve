import {
  mergeSyncPolicies,
  resolveSyncPolicy,
  type ResolvedSyncPolicy,
  type ShelveSyncConfig,
} from '@types'
import { CliError } from '../services/api-error'

export function getEffectiveSyncConfig(
  fileSync: ShelveSyncConfig | undefined,
  serverSync: ShelveSyncConfig | null | undefined,
): ShelveSyncConfig | undefined {
  return mergeSyncPolicies(fileSync, serverSync ?? undefined)
}

export function getResolvedSyncPolicy(
  environmentName: string,
  fileSync?: ShelveSyncConfig | undefined,
  serverSync?: ShelveSyncConfig | null | undefined,
): ResolvedSyncPolicy {
  const merged = getEffectiveSyncConfig(fileSync, serverSync)
  const envOverrides: { allowPush?: boolean } = {}
  if (process.env.SHELVE_SYNC_ALLOW_PUSH === '0' || process.env.SHELVE_SYNC_ALLOW_PUSH === 'false') {
    envOverrides.allowPush = false
  }
  if (process.env.SHELVE_SYNC_ALLOW_PULL === '0' || process.env.SHELVE_SYNC_ALLOW_PULL === 'false') {
    return {
      ...resolveSyncPolicy(environmentName, merged, envOverrides),
      allowPull: false,
    }
  }
  return resolveSyncPolicy(environmentName, merged, envOverrides)
}

export function assertPushAllowed(policy: ResolvedSyncPolicy, environmentName: string): void {
  if (!policy.allowPush) {
    throw new CliError(
      `Push to "${environmentName}" is blocked by sync policy.`,
      'PUSH_BLOCKED',
      undefined,
      'Remove the environment from sync.protectedEnvironments or set allowPush: true.',
    )
  }
}

export function assertPullAllowed(policy: ResolvedSyncPolicy, environmentName: string): void {
  if (!policy.allowPull) {
    throw new CliError(
      `Pull from "${environmentName}" is blocked by sync policy.`,
      'PULL_BLOCKED',
      undefined,
      'Set sync.environments.<env>.allowPull to true.',
    )
  }
}

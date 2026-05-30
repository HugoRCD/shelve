import type { EnvVar, EnvVarExport } from './Variables'

export type SourceOfTruth = 'remote' | 'local'

export type OnPushConflict = 'overwrite' | 'skip' | 'fail' | 'prompt'

export type PullMode = 'replace' | 'merge'

export type SyncPolicy = {
  sourceOfTruth?: SourceOfTruth
  onPushConflict?: OnPushConflict
  pullMode?: PullMode
  allowPush?: boolean
  allowPull?: boolean
  requireConfirmation?: boolean
}

export type ShelveSyncConfig = {
  default?: SyncPolicy
  environments?: Record<string, SyncPolicy>
  protectedEnvironments?: string[]
}

export const DEFAULT_SYNC_POLICY: Required<Pick<SyncPolicy, 'sourceOfTruth' | 'onPushConflict' | 'pullMode' | 'allowPush' | 'allowPull'>> = {
  sourceOfTruth: 'remote',
  onPushConflict: 'overwrite',
  pullMode: 'replace',
  allowPush: true,
  allowPull: true,
}

export type ResolvedSyncPolicy = SyncPolicy & typeof DEFAULT_SYNC_POLICY & {
  requireConfirmation: boolean
}

export type EnvDiffResult = {
  onlyLocal: string[]
  onlyRemote: string[]
  changed: string[]
  unchanged: string[]
}

type KeyedVar = { key: string, value: string }

function normalizeKey(key: string, autoUppercase?: boolean): string {
  return autoUppercase ? key.toUpperCase() : key
}

function toKeyedMap(vars: KeyedVar[], autoUppercase?: boolean): Map<string, string> {
  const map = new Map<string, string>()
  for (const v of vars) {
    map.set(normalizeKey(v.key, autoUppercase), v.value)
  }
  return map
}

export function resolveSyncPolicy(
  environmentName: string,
  sync?: ShelveSyncConfig | null,
  envOverrides?: { allowPush?: boolean },
): ResolvedSyncPolicy {
  const envPolicy = sync?.environments?.[environmentName]
  const merged: SyncPolicy = {
    ...DEFAULT_SYNC_POLICY,
    ...sync?.default,
    ...envPolicy,
  }

  const protectedEnvs = sync?.protectedEnvironments ?? []
  if (protectedEnvs.includes(environmentName)) {
    merged.allowPush = false
  }

  if (envOverrides?.allowPush === false) {
    merged.allowPush = false
  }

  return {
    sourceOfTruth: merged.sourceOfTruth ?? DEFAULT_SYNC_POLICY.sourceOfTruth,
    onPushConflict: merged.onPushConflict ?? DEFAULT_SYNC_POLICY.onPushConflict,
    pullMode: merged.pullMode ?? DEFAULT_SYNC_POLICY.pullMode,
    allowPush: merged.allowPush ?? DEFAULT_SYNC_POLICY.allowPush,
    allowPull: merged.allowPull ?? DEFAULT_SYNC_POLICY.allowPull,
    requireConfirmation: merged.requireConfirmation ?? false,
  }
}

/** Server guardrails win when they are stricter (allow* false). */
export function mergeSyncPolicies(
  fileSync?: ShelveSyncConfig | null,
  serverSync?: ShelveSyncConfig | null,
): ShelveSyncConfig | undefined {
  if (!fileSync && !serverSync) return undefined
  if (!serverSync) return fileSync ?? undefined
  if (!fileSync) return serverSync

  const envNames = new Set([
    ...Object.keys(fileSync.environments ?? {}),
    ...Object.keys(serverSync.environments ?? {}),
  ])

  const environments: Record<string, SyncPolicy> = {}
  for (const name of envNames) {
    const fileEnv = fileSync.environments?.[name]
    const serverEnv = serverSync.environments?.[name]
    const merged = mergeSyncPolicyPair(fileEnv, serverEnv)
    if (merged) environments[name] = merged
  }

  return {
    default: mergeSyncPolicyPair(fileSync.default, serverSync.default),
    environments: Object.keys(environments).length ? environments : undefined,
    protectedEnvironments: [
      ...new Set([
        ...(fileSync.protectedEnvironments ?? []),
        ...(serverSync.protectedEnvironments ?? []),
      ]),
    ],
  }
}

function mergeSyncPolicyPair(file?: SyncPolicy, server?: SyncPolicy): SyncPolicy | undefined {
  if (!file && !server) return undefined
  return {
    ...file,
    ...server,
    allowPush: server?.allowPush === false ? false : file?.allowPush,
    allowPull: server?.allowPull === false ? false : file?.allowPull,
  }
}

export function diffEnvVars(
  local: KeyedVar[],
  remote: KeyedVar[],
  autoUppercase = true,
): EnvDiffResult {
  const localMap = toKeyedMap(local, autoUppercase)
  const remoteMap = toKeyedMap(remote, autoUppercase)

  const onlyLocal: string[] = []
  const onlyRemote: string[] = []
  const changed: string[] = []
  const unchanged: string[] = []

  for (const [key, localValue] of localMap) {
    if (!remoteMap.has(key)) {
      onlyLocal.push(key)
      continue
    }
    const remoteValue = remoteMap.get(key)!
    if (localValue !== remoteValue) changed.push(key)
    else unchanged.push(key)
  }

  for (const key of remoteMap.keys()) {
    if (!localMap.has(key)) onlyRemote.push(key)
  }

  onlyLocal.sort()
  onlyRemote.sort()
  changed.sort()
  unchanged.sort()

  return { onlyLocal, onlyRemote, changed, unchanged }
}

export function filterVarsByKeys<T extends { key: string }>(
  variables: T[],
  keys: Set<string>,
  autoUppercase = true,
): T[] {
  return variables.filter(v => keys.has(normalizeKey(v.key, autoUppercase)))
}

export function excludeVarsByKeys<T extends { key: string }>(
  variables: T[],
  keys: Set<string>,
  autoUppercase = true,
): T[] {
  return variables.filter(v => !keys.has(normalizeKey(v.key, autoUppercase)))
}

export function mergeEnvVarsForPull(
  local: EnvVar[],
  remote: EnvVarExport[],
  autoUppercase = true,
): EnvVarExport[] {
  const diff = diffEnvVars(local, remote, autoUppercase)
  const onlyLocalSet = new Set(diff.onlyLocal)
  const localOnly = filterVarsByKeys(local, onlyLocalSet, autoUppercase).map(v => ({
    key: normalizeKey(v.key, autoUppercase),
    value: v.value,
  }))
  const remoteNormalized = remote.map(v => ({
    ...v,
    key: normalizeKey(v.key, autoUppercase),
  }))
  return [...remoteNormalized, ...localOnly]
}

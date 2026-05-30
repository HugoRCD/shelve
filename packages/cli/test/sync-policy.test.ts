import { describe, expect, it } from 'vitest'
import {
  diffEnvVars,
  mergeEnvVarsForPull,
  mergeSyncPolicies,
  resolveSyncPolicy,
} from '@types'
import { getResolvedSyncPolicy } from '../src/utils/sync-policy'

describe('resolveSyncPolicy', () => {
  it('uses defaults when sync is undefined', () => {
    const policy = resolveSyncPolicy('development')
    expect(policy.allowPush).toBe(true)
    expect(policy.pullMode).toBe('replace')
    expect(policy.onPushConflict).toBe('overwrite')
  })

  it('blocks push for protected environments', () => {
    const policy = resolveSyncPolicy('production', {
      protectedEnvironments: ['production'],
    })
    expect(policy.allowPush).toBe(false)
  })

  it('merges per-environment overrides', () => {
    const policy = resolveSyncPolicy('staging', {
      default: { onPushConflict: 'skip' },
      environments: { staging: { onPushConflict: 'fail' } },
    })
    expect(policy.onPushConflict).toBe('fail')
  })
})

describe('mergeSyncPolicies', () => {
  it('server allowPush false wins over file true', () => {
    const merged = mergeSyncPolicies(
      { environments: { production: { allowPush: true } } },
      { environments: { production: { allowPush: false } } },
    )
    expect(resolveSyncPolicy('production', merged).allowPush).toBe(false)
  })
})

describe('getResolvedSyncPolicy env override', () => {
  it('disables push when SHELVE_SYNC_ALLOW_PUSH=0', () => {
    const prev = process.env.SHELVE_SYNC_ALLOW_PUSH
    process.env.SHELVE_SYNC_ALLOW_PUSH = '0'
    try {
      expect(getResolvedSyncPolicy('development').allowPush).toBe(false)
    } finally {
      if (prev === undefined) delete process.env.SHELVE_SYNC_ALLOW_PUSH
      else process.env.SHELVE_SYNC_ALLOW_PUSH = prev
    }
  })
})

describe('diffEnvVars', () => {
  it('classifies onlyLocal, onlyRemote, changed, unchanged', () => {
    const diff = diffEnvVars(
      [
        { key: 'A', value: '1' },
        { key: 'B', value: 'local' },
        { key: 'C', value: 'same' },
      ],
      [
        { key: 'B', value: 'remote' },
        { key: 'C', value: 'same' },
        { key: 'D', value: '2' },
      ],
    )
    expect(diff.onlyLocal).toEqual(['A'])
    expect(diff.onlyRemote).toEqual(['D'])
    expect(diff.changed).toEqual(['B'])
    expect(diff.unchanged).toEqual(['C'])
  })
})

describe('mergeEnvVarsForPull', () => {
  it('keeps local-only keys when merging', () => {
    const merged = mergeEnvVarsForPull(
      [{ key: 'LOCAL_ONLY', value: 'x' }],
      [{ key: 'REMOTE', value: 'y', description: undefined }],
    )
    expect(merged.map(v => v.key).sort()).toEqual(['LOCAL_ONLY', 'REMOTE'])
    expect(merged.find(v => v.key === 'REMOTE')?.value).toBe('y')
  })
})

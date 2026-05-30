import { describe, expect, test } from 'vitest'
import type { AuditLog } from '@types'
import { buildSummary } from '../../server/utils/audit-present'

const emptyMaps = {
  users: new Map(),
  tokens: new Map(),
  projects: new Map([ [13, { name: 'web-platform', teamId: 1 }] ]),
  environments: new Map([ [86, { name: 'production', teamId: 1 }] ]),
}

function log(overrides: Partial<AuditLog>): AuditLog {
  return {
    id: 1,
    teamId: 1,
    actorType: 'token',
    actorId: 5,
    action: 'variables.read',
    resourceType: 'environment',
    resourceId: '86',
    ip: '127.0.0.1',
    userAgent: 'shelve-cli/5.0.0',
    metadata: { projectId: 13 },
    createdAt: new Date(),
    ...overrides,
  }
}

describe('buildSummary', () => {
  test('describes variable reads with project and environment names', () => {
    const summary = buildSummary(log({}), emptyMaps)
    expect(summary).toBe('Read secrets from web-platform / production')
  })

  test('uses metadata names when present', () => {
    const summary = buildSummary(log({
      metadata: { projectId: 13, projectName: 'api', environmentName: 'staging' },
    }), emptyMaps)
    expect(summary).toBe('Read secrets from api / staging')
  })

  test('describes token creation', () => {
    const summary = buildSummary(log({
      action: 'token.create',
      resourceType: 'token',
      resourceId: '9',
      metadata: { name: 'ci-deploy' },
    }), emptyMaps)
    expect(summary).toBe('Created API token ci-deploy')
  })
})

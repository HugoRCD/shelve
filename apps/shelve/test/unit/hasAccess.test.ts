import { describe, test, expect } from 'vitest'
import { TeamRole } from '@types'
import { hasAccess } from '../../app/utils/hasAccess'

describe('hasAccess', () => {
  test('returns false when userRole is undefined', () => {
    expect(hasAccess(undefined)).toBe(false)
    expect(hasAccess(undefined, TeamRole.ADMIN)).toBe(false)
  })

  test('MEMBER can access MEMBER-level resources', () => {
    expect(hasAccess(TeamRole.MEMBER, TeamRole.MEMBER)).toBe(true)
  })

  test('MEMBER cannot access ADMIN-level resources', () => {
    expect(hasAccess(TeamRole.MEMBER, TeamRole.ADMIN)).toBe(false)
  })

  test('MEMBER cannot access OWNER-level resources', () => {
    expect(hasAccess(TeamRole.MEMBER, TeamRole.OWNER)).toBe(false)
  })

  test('ADMIN can access MEMBER-level resources', () => {
    expect(hasAccess(TeamRole.ADMIN, TeamRole.MEMBER)).toBe(true)
  })

  test('ADMIN can access ADMIN-level resources', () => {
    expect(hasAccess(TeamRole.ADMIN, TeamRole.ADMIN)).toBe(true)
  })

  test('ADMIN cannot access OWNER-level resources', () => {
    expect(hasAccess(TeamRole.ADMIN, TeamRole.OWNER)).toBe(false)
  })

  test('OWNER can access all levels', () => {
    expect(hasAccess(TeamRole.OWNER, TeamRole.MEMBER)).toBe(true)
    expect(hasAccess(TeamRole.OWNER, TeamRole.ADMIN)).toBe(true)
    expect(hasAccess(TeamRole.OWNER, TeamRole.OWNER)).toBe(true)
  })

  test('defaults to MEMBER required role', () => {
    expect(hasAccess(TeamRole.MEMBER)).toBe(true)
    expect(hasAccess(TeamRole.ADMIN)).toBe(true)
    expect(hasAccess(TeamRole.OWNER)).toBe(true)
  })
})

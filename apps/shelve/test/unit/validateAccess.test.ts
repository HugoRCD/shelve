import { describe, test, expect, vi, beforeEach } from 'vitest'
import { TeamRole } from '@types'

vi.stubGlobal('createError', (opts: { statusCode: number, statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
})

const { validateTeamRole } = await import('../../server/utils/validateAccess')

describe('validateTeamRole', () => {
  const makeMember = (role: TeamRole) => ({ role }) as any

  test('OWNER passes all role checks', () => {
    expect(validateTeamRole(makeMember(TeamRole.OWNER), TeamRole.OWNER)).toBe(true)
    expect(validateTeamRole(makeMember(TeamRole.OWNER), TeamRole.ADMIN)).toBe(true)
    expect(validateTeamRole(makeMember(TeamRole.OWNER), TeamRole.MEMBER)).toBe(true)
  })

  test('ADMIN passes ADMIN and MEMBER checks', () => {
    expect(validateTeamRole(makeMember(TeamRole.ADMIN), TeamRole.ADMIN)).toBe(true)
    expect(validateTeamRole(makeMember(TeamRole.ADMIN), TeamRole.MEMBER)).toBe(true)
  })

  test('ADMIN fails OWNER check', () => {
    expect(() => validateTeamRole(makeMember(TeamRole.ADMIN), TeamRole.OWNER)).toThrow(
      'Unauthorized: User does not have the required role'
    )
  })

  test('MEMBER passes MEMBER check', () => {
    expect(validateTeamRole(makeMember(TeamRole.MEMBER), TeamRole.MEMBER)).toBe(true)
  })

  test('MEMBER fails ADMIN check', () => {
    expect(() => validateTeamRole(makeMember(TeamRole.MEMBER), TeamRole.ADMIN)).toThrow(
      'Unauthorized: User does not have the required role'
    )
  })

  test('MEMBER fails OWNER check', () => {
    expect(() => validateTeamRole(makeMember(TeamRole.MEMBER), TeamRole.OWNER)).toThrow(
      'Unauthorized: User does not have the required role'
    )
  })

  test('defaults to MEMBER minimum role', () => {
    expect(validateTeamRole(makeMember(TeamRole.MEMBER))).toBe(true)
  })

  test('thrown error has status code 403', () => {
    try {
      validateTeamRole(makeMember(TeamRole.MEMBER), TeamRole.OWNER)
    } catch (e: any) {
      expect(e.statusCode).toBe(403)
    }
  })
})

import { describe, test, expect, vi, beforeEach } from 'vitest'
import { TeamRole } from '@types'

vi.stubGlobal('createError', (opts: { statusCode: number, statusMessage: string }) => {
  const err = new Error(opts.statusMessage) as Error & { statusCode: number }
  err.statusCode = opts.statusCode
  return err
})

const findMember = vi.fn()
vi.stubGlobal('schema', await import('../../server/db/schema'))
vi.stubGlobal('db', { query: { members: { findFirst: findMember } } })
vi.stubGlobal('PUBLIC_USER_COLUMNS', { id: true })
// The cached team still lists user 1 as an owner.
vi.stubGlobal('TeamsService', class {

  getTeam = () => Promise.resolve({ id: 10, slug: 'acme', members: [{ userId: 1, role: TeamRole.OWNER }] })

})

const { validateTeamAccess, validateTeamRole } = await import('../../server/utils/validateAccess')

describe('validateTeamAccess', () => {
  const user = { id: 1 } as any

  beforeEach(() => {
    findMember.mockReset()
  })

  test('refuses a user removed from the team after it was cached', async () => {
    findMember.mockResolvedValue(undefined)

    await expect(validateTeamAccess({ user, teamSlug: 'acme' })).rejects.toMatchObject({ statusCode: 403 })
  })

  test('uses the role in the database, not the one in the cached team', async () => {
    findMember.mockResolvedValue({ userId: 1, teamId: 10, role: TeamRole.MEMBER })

    const { member } = await validateTeamAccess({ user, teamSlug: 'acme' })

    expect(member.role).toBe(TeamRole.MEMBER)
    expect(() => validateTeamRole(member, TeamRole.ADMIN)).toThrow('Unauthorized: User does not have the required role')
  })
})

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

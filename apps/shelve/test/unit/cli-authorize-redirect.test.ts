import { describe, test, expect } from 'vitest'
import { isCliAuthorizeRedirect, parseCliAuthorizeRedirect } from '../../shared/cli-authorize'

describe('isCliAuthorizeRedirect', () => {
  test('returns true for cli authorize paths', () => {
    expect(isCliAuthorizeRedirect('/cli/authorize')).toBe(true)
    expect(isCliAuthorizeRedirect('/cli/authorize?user_code=ABCD-EFGH')).toBe(true)
  })

  test('returns false for other redirects', () => {
    expect(isCliAuthorizeRedirect('/')).toBe(false)
    expect(isCliAuthorizeRedirect('/onboarding')).toBe(false)
    expect(isCliAuthorizeRedirect(undefined)).toBe(false)
  })
})

describe('parseCliAuthorizeRedirect', () => {
  test('extracts normalized user code', () => {
    expect(parseCliAuthorizeRedirect('/cli/authorize?user_code=abcd-efgh')).toEqual({
      isCliAuthorize: true,
      userCode: 'ABCD-EFGH',
    })
  })

  test('marks cli flow without code', () => {
    expect(parseCliAuthorizeRedirect('/cli/authorize')).toEqual({
      isCliAuthorize: true,
      userCode: null,
    })
  })

  test('returns non-cli for unrelated paths', () => {
    expect(parseCliAuthorizeRedirect('/invite/token')).toEqual({
      isCliAuthorize: false,
      userCode: null,
    })
  })
})

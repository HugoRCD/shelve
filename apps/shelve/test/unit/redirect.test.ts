import { describe, test, expect } from 'vitest'
import { getSafeRedirectPath } from '../../server/utils/redirect'

// `/auth/github?redirect=` passes this path to Better Auth as the post-login destination.
describe('getSafeRedirectPath', () => {
  test('refuses paths browsers read as another site', () => {
    expect(getSafeRedirectPath('/\\evil.example')).toBeUndefined()
    expect(getSafeRedirectPath('/\tevil.example')).toBeUndefined()
    expect(getSafeRedirectPath('//evil.example')).toBeUndefined()
    expect(getSafeRedirectPath('//localhost/account')).toBeUndefined()
    expect(getSafeRedirectPath('https://evil.example')).toBeUndefined()
  })

  test('keeps paths on this site', () => {
    expect(getSafeRedirectPath('/my-team')).toBe('/my-team')
    expect(getSafeRedirectPath('/user/integrations?integration=github')).toBe('/user/integrations?integration=github')
  })
})

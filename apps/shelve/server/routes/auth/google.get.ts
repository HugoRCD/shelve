import { AuthType } from '@types'
import { userSchema } from '~~/server/db/zod'

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['profile', 'email'],
  },
  async onSuccess(event, { user, tokens }) {
    try {
      const appUrl = getRequestHost(event)
      const _user = await handleOAuthUser({
        email: user.email,
        avatar: user.picture,
        username: `${user.given_name}_${user.family_name}`,
        authType: AuthType.GOOGLE,
        providerAccountId: user.sub,
        appUrl,
      }, event)
      await setUserSession(event, {
        secure: {
          googleToken: tokens.access_token,
        },
        user: userSchema.parse(_user),
        loggedInAt: new Date(),
      })

      const redirectCookie = getCookie(event, 'auth_redirect')
      if (redirectCookie) {
        deleteCookie(event, 'auth_redirect')
        const redirectUrl = getSafeRedirectPath(redirectCookie)
        if (redirectUrl) return sendRedirect(event, redirectUrl)
      }

      if (!_user.onboarding) {
        return sendRedirect(event, '/onboarding')
      }

      const defaultTeamSlug = getCookie(event, 'defaultTeamSlug')
      if (defaultTeamSlug) {
        return sendRedirect(event, `/${encodeURIComponent(defaultTeamSlug)}`)
      }

      return sendRedirect(event, '/')
    } catch (error) {
      console.error('Google OAuth error:', error)
      return sendRedirect(event, '/login?error=google')
    }
  },
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/login?error=google')
  },
})

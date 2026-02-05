import { AuthType } from '@types'
import { userSchema } from '~~/server/db/zod'

export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
    scope: ['repo', 'user:email'],
  },
  async onSuccess(event, { user, tokens }) {
    try {
      const appUrl = getRequestHost(event)
      const _user = await handleOAuthUser({
        email: user.email,
        avatar: user.avatar_url,
        username: user.login,
        authType: AuthType.GITHUB,
        appUrl,
      }, event)
      await setUserSession(event, {
        secure: {
          githubToken: tokens.access_token,
        },
        user: userSchema.parse(_user),
        loggedInAt: new Date(),
      })

      const redirectUrl = getCookie(event, 'auth_redirect')
      if (redirectUrl) {
        deleteCookie(event, 'auth_redirect')
        return sendRedirect(event, redirectUrl)
      }

      if (!_user.onboarding) {
        return sendRedirect(event, '/onboarding')
      }

      const defaultTeamSlug = getCookie(event, 'defaultTeamSlug')
      if (defaultTeamSlug) {
        return sendRedirect(event, `/${defaultTeamSlug}`)
      }

      return sendRedirect(event, '/')
    } catch (error) {
      console.error('GitHub OAuth error:', error)
      return sendRedirect(event, '/login?error=github')
    }
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/login?error=github')
  },
})

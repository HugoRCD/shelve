import { AuthType } from '@types'
import { userSchema } from '~~/server/database/zod'

export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
    scope: ['repo', 'user:email'],
  },
  async onSuccess(event, { user, tokens }) {
    try {
      const appUrl= getRequestHost(event)
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
        loggedInAt: new Date().toISOString(),
      })
      return sendRedirect(event, _user.onboarding ? '/' : '/onboarding')
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

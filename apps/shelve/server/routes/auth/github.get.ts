import { AuthType } from '@types'
import { userSchema } from '~~/server/database/zod'

export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
    scope: ['repo', 'user:email'],
  },
  async onSuccess(event, { user, tokens }) {
    try {
      const appUrl = getRequestHost(event) || 'localhost'
      const _user = await handleOAuthUser({
        email: user.email,
        avatar: user.avatar_url,
        username: user.login,
        authType: AuthType.GITHUB,
        appUrl,
      }, event)
      
      const session = await getUserSession(event)
      const redirectUrl = handleOAuthRedirect(event, session, _user.onboarding ? '/' : '/onboarding')
      
      await setUserSession(event, {
        secure: {
          githubToken: tokens.access_token,
        },
        user: userSchema.parse(_user),
        loggedInAt: new Date(),
        pendingOAuthRedirect: undefined
      })

      return sendRedirect(event, redirectUrl)
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

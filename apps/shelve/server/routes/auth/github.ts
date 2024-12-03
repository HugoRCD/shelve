import { AuthType } from '@shelve/types'
import { handleOAuthUser } from '~~/server/services/user'
import { userSchema } from '~~/server/database/zod'

export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
    scope: ['repo', 'user:email'],
  },
  async onSuccess(event, { user, tokens }) {
    try {
      const _user = await handleOAuthUser({
        email: user.email,
        avatar: user.avatar_url,
        username: user.login,
        authType: AuthType.GITHUB,
      })
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

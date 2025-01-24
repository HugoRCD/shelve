import { AuthType } from '@shelve/types'
import { handleOAuthUser } from '~~/server/services/user'
import { userSchema } from '~~/server/database/zod'

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['profile', 'email'],
  },
  async onSuccess(event, { user, tokens }) {
    try {
      const appUrl= getRequestHost(event)
      const _user = await handleOAuthUser({
        email: user.email,
        avatar: user.picture,
        username: `${user.given_name}_${user.family_name}`,
        authType: AuthType.GOOGLE,
        appUrl,
      })
      await setUserSession(event, {
        secure: {
          googleToken: tokens.access_token,
        },
        user: userSchema.parse(_user),
        loggedInAt: new Date().toISOString(),
      })
      return sendRedirect(event, _user.onboarding ? '/' : '/onboarding')
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

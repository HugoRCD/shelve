import { AuthType } from '@types'
import { userSchema } from '~~/server/database/zod'

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['email', 'profile'],
  },
  async onSuccess(event, { user, tokens }) {
    try {
      const appUrl = getRequestHost(event) || 'localhost'
      const _user = await handleOAuthUser({
        email: user.email,
        avatar: user.picture,
        username: user.given_name,
        authType: AuthType.GOOGLE,
        appUrl,
      }, event)
      
      const session = await getUserSession(event)
      const redirectUrl = handleOAuthRedirect(event, session, _user.onboarding ? '/' : '/onboarding')
      
      await setUserSession(event, {
        secure: {
          googleToken: tokens.access_token,
        },
        user: userSchema.parse(_user),
        loggedInAt: new Date(),
        pendingOAuthRedirect: undefined
      })

      return sendRedirect(event, redirectUrl)
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

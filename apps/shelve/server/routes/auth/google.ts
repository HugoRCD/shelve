import { AuthType } from '@shelve/types'
import { UserService } from '~~/server/services/user.service'
import { userSchema } from '~~/server/database/zod'

export default defineOAuthGoogleEventHandler({
  config: {
    scope: ['profile', 'email'],
  },
  async onSuccess(event, { user, tokens }) {
    try {
      const _user = await new UserService().handleOAuthUser({
        email: user.email,
        avatar: user.picture,
        username: `${user.given_name}_${user.family_name}`,
        authType: AuthType.GOOGLE,
      })
      await setUserSession(event, {
        secure: {
          googleToken: tokens.access_token,
        },
        user: userSchema.parse(_user),
        loggedInAt: new Date().toISOString(),
      })
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

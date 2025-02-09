import { AuthType } from '@types'

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
      }, event)
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

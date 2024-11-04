import { UserService } from '~~/server/services/user.service'
import { EmailService } from '~~/server/services/resend.service'

export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
    scope: ['repo', 'user:email'],
  },
  async onSuccess(event, { user, tokens }) {
    const userService = new UserService()
    const emailService = new EmailService()
    try {
      const _user = await userService.upsertUser({
        email: user.email,
        avatar: user.avatar_url,
        username: user.login,
      })
      await setUserSession(event, {
        secure: {
          githubToken: tokens.access_token,
        },
        user: {
          id: _user.id,
          username: _user.username,
          email: user.email,
          avatar: user.avatar_url,
          role: _user.role,
        },
        loggedInAt: new Date().toISOString(),
      })
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

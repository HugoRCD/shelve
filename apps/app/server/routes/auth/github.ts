import { upsertUser } from '~~/server/app/userService'

export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
    scope: ['repo', 'user:email'],
  },
  async onSuccess(event, { user, tokens }) {
    try {
      const _user = await upsertUser({
        email: user.email,
        avatar: user.avatar_url,
        username: user.login,
      })
      await setUserSession(event, {
        tokens: {
          github: tokens.access_token,
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
      return sendRedirect(event, '/app/projects')
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

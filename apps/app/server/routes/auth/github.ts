import { upsertUser } from '~~/server/app/userService'

export default oauthGitHubEventHandler({
  config: {
    emailRequired: true,
    scope: ['repo', 'user:email'],
  },
  async onSuccess(event, { user, tokens }) {
    const _user = await upsertUser({
      email: user.email,
      avatar: user.avatar_url,
    }, 'github')
    await setUserSession(event, {
      accessToken: tokens.access_token,
      user: {
        id: _user.id,
        username: user.login,
        email: user.email,
        avatar: user.avatar_url,
        role: _user.role,
      },
      loggedInAt: new Date().toISOString(),
    })
    return sendRedirect(event, '/app/projects')
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/login?error=github')
  },
})

export default oauthGitHubEventHandler({
  config: {
    emailRequired: true,
    scope: ['repo', 'user:email'],
  },
  async onSuccess(event, { user, tokens }) {
    await setUserSession(event, {
      accessToken: tokens.access_token,
      user: {
        username: user.login,
        email: user.email,
        avatar: user.avatar_url,
      },
      loggedInAt: new Date().toISOString(),
    })
    return sendRedirect(event, '/app/settings')
  },
  onError(event, error) {
    console.error('GitHub OAuth error:', error)
    return sendRedirect(event, '/app/settings')
  },
})

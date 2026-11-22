import { AuthType } from '@types'
import { userSchema } from '~~/server/db/zod'

type GitHubEmail = { email: string; primary: boolean; verified: boolean }

/** The account's primary email, when GitHub has verified it. */
async function getVerifiedPrimaryEmail(accessToken: string): Promise<string | undefined> {
  const emails = await $fetch<GitHubEmail[]>('https://api.github.com/user/emails', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github+json',
    },
  })
  return emails.find(entry => entry.primary && entry.verified)?.email
}

export default defineOAuthGitHubEventHandler({
  config: {
    emailRequired: true,
    scope: ['repo', 'user:email'],
  },
  async onSuccess(event, { user, tokens }) {
    try {
      // The email nuxt-auth-utils picks may be unverified, so ask GitHub which one is.
      const verifiedEmail = await getVerifiedPrimaryEmail(tokens.access_token)
      const _user = await handleOAuthUser({
        email: verifiedEmail ?? user.email,
        emailVerified: !!verifiedEmail,
        avatar: user.avatar_url,
        username: user.login,
        authType: AuthType.GITHUB,
        providerAccountId: String(user.id),
      }, event)
      if (!_user) return sendRedirect(event, '/login?error=unverified-email')
      await replaceUserSession(event, {
        secure: {
          githubToken: tokens.access_token,
        },
        user: userSchema.parse(_user),
        loggedInAt: new Date(),
      })

      const redirectCookie = getCookie(event, 'auth_redirect')
      if (redirectCookie) {
        deleteCookie(event, 'auth_redirect')
        const redirectUrl = getSafeRedirectPath(redirectCookie)
        if (redirectUrl) return sendRedirect(event, redirectUrl)
      }

      if (!_user.onboarding) {
        return sendRedirect(event, '/onboarding')
      }

      const defaultTeamSlug = getCookie(event, 'defaultTeamSlug')
      if (defaultTeamSlug) {
        return sendRedirect(event, `/${encodeURIComponent(defaultTeamSlug)}`)
      }

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

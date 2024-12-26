import type { H3Event } from 'h3'
import { z } from 'zod'
import jwt from 'jsonwebtoken'

type GitHubRepo = {
  name: string
  owner: { login: string }
}

type GitHubAppOwner = {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  user_view_type: string
  site_admin: boolean
}

type GitHubAppPermissions = {
  issues: 'write' | 'read'
  pull_requests: 'write' | 'read'
  contents: 'write' | 'read'
  metadata: 'write' | 'read'
}

type GitHubAppResponse = {
  id: number
  client_id: string
  slug: string
  node_id: string
  owner: GitHubAppOwner
  name: string
  description: string
  external_url: string
  html_url: string
  created_at: string
  updated_at: string
  webhook_secret: string
  pem: string
  client_secret: string
  permissions: GitHubAppPermissions
  events: string[]
}

export class GithubService {

  private readonly GITHUB_API = 'https://api.github.com'
  private readonly tokenCache = new Map<string, { token: string, expiresAt: Date }>()

  async handleAppCallback(event: H3Event) {
    const { user } = await getUserSession(event)
    const { code } = await getValidatedQuery(event, z.object({
      code: z.string({ required_error: 'code is required' }),
    }).parse)

    const appConfig = await $fetch<GitHubAppResponse>(`${this.GITHUB_API}/app-manifests/${code}/conversions`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
      }
    })

    await useDrizzle().insert(tables.githubApp)
      .values({
        slug: appConfig.slug,
        appId: appConfig.id,
        privateKey: appConfig.pem,
        webhookSecret: appConfig.webhook_secret,
        clientId: appConfig.client_id,
        clientSecret: appConfig.client_secret,
        userId: user!.id,
      })

    return sendRedirect(event, `https://github.com/apps/${appConfig.slug}/installations/new`)
  }

  private async getAuthToken(userId: number): Promise<string> {
    const cached = this.tokenCache.get(String(userId))
    if (cached?.expiresAt && cached.expiresAt > new Date()) {
      return cached.token
    }

    const app = await useDrizzle().query.githubApp.findFirst({
      where: eq(tables.githubApp.userId, userId)
    })
    if (!app) throw createError({ statusCode: 404, statusMessage: 'GitHub App not found' })

    const now = Math.floor(Date.now() / 1000)
    const appJWT = jwt.sign({
      iat: now - 60,
      exp: now + (10 * 60),
      iss: app.appId
    }, app.privateKey, { algorithm: 'RS256' })

    const installations = await $fetch<{ id: number }[]>(`${this.GITHUB_API}/app/installations`, {
      headers: {
        Authorization: `Bearer ${appJWT}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })
    if (!installations.length) throw createError({ statusCode: 404, statusMessage: 'GitHub App not installed in any repositories' })

    const { token } = await $fetch<{ token: string, expires_at: string }>(`${this.GITHUB_API}/app/installations/${installations[0].id}/access_tokens`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${appJWT}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })

    this.tokenCache.set(String(userId), {
      token,
      expiresAt: new Date(Date.now() + 55 * 60 * 1000)
    })

    return token
  }

  async getUserRepos(event: H3Event): Promise<GitHubRepo[]> {
    const { user } = await getUserSession(event)
    const token = await this.getAuthToken(user!.id)

    return await $fetch<GitHubRepo[]>(`${this.GITHUB_API}/installation/repositories`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })
  }

}

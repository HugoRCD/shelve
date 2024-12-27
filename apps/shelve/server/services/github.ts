import jwt from 'jsonwebtoken'
import { GithubApp, GitHubAppResponse, GitHubRepo } from '@shelve/types'

export class GithubService {

  private readonly GITHUB_API = 'https://api.github.com'
  private readonly tokenCache = new Map<string, { token: string, expiresAt: Date }>()
  private readonly encryptionKey: string

  constructor() {
    this.encryptionKey = useRuntimeConfig().private.encryptionKey
  }

  private async encryptValue(value: string): Promise<string> {
    return await seal(value, this.encryptionKey)
  }

  private async decryptValue(value: string): Promise<string> {
    return await unseal(value, this.encryptionKey) as string
  }

  async handleAppCallback(userId: number, code: string) {
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
        privateKey: await this.encryptValue(appConfig.pem),
        webhookSecret: await this.encryptValue(appConfig.webhook_secret),
        clientId: appConfig.client_id,
        clientSecret: await this.encryptValue(appConfig.client_secret),
        userId: userId,
      })

    return `https://github.com/apps/${appConfig.slug}/installations/new`
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
    const privateKey = await this.decryptValue(app.privateKey)

    const now = Math.floor(Date.now() / 1000)
    const appJWT = jwt.sign({
      iat: now - 60,
      exp: now + (10 * 60),
      iss: app.appId
    }, privateKey, { algorithm: 'RS256' })

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

  async getUserRepos(userId: number): Promise<GitHubRepo[]> {
    const token = await this.getAuthToken(userId)

    return await $fetch<GitHubRepo[]>(`${this.GITHUB_API}/installation/repositories`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json'
      }
    })
  }

  async getUserApps(userId: number): Promise<GithubApp[]> {
    return await useDrizzle().query.githubApp.findMany({
      where: eq(tables.githubApp.userId, userId)
    })
  }

  async deleteApp(userId: number, slug: string) {
    await useDrizzle().delete(tables.githubApp)
      .where(and(
        eq(tables.githubApp.userId, userId),
        eq(tables.githubApp.slug, slug)
      ))

    return {
      statusCode: 200,
      message: 'App removed from Shelve. Dont forget to delete it from GitHub',
      link: `https://github.com/settings/apps/${slug}/advanced`
    }
  }

}

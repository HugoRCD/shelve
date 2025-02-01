import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'
import type { GithubApp, GitHubAppResponse, GitHubRepo } from '@types'

import nacl from 'tweetnacl'
import { blake2b } from 'blakejs'

function deriveNonce(
  ephemeralPublicKey: Uint8Array,
  recipientPublicKey: Uint8Array
): Uint8Array {
  const input = new Uint8Array(
    ephemeralPublicKey.length + recipientPublicKey.length
  )
  input.set(ephemeralPublicKey, 0)
  input.set(recipientPublicKey, ephemeralPublicKey.length)
  return blake2b(input, undefined, nacl.box.nonceLength)
}

function cryptoBoxSeal(
  message: Uint8Array,
  recipientPublicKey: Uint8Array
): Uint8Array {
  const ephemeralKeyPair = nacl.box.keyPair()
  const nonce = deriveNonce(ephemeralKeyPair.publicKey, recipientPublicKey)
  const encryptedMessage = nacl.box(
    message,
    nonce,
    recipientPublicKey,
    ephemeralKeyPair.secretKey
  )
  const sealedBox = new Uint8Array(
    ephemeralKeyPair.publicKey.length + encryptedMessage.length
  )
  sealedBox.set(ephemeralKeyPair.publicKey, 0)
  sealedBox.set(encryptedMessage, ephemeralKeyPair.publicKey.length)
  return sealedBox
}

export class GithubService {

  private readonly GITHUB_API = 'https://api.github.com'
  private readonly tokenCache = new Map<string, { token: string; expiresAt: Date }>()
  private readonly encryptionKey: string

  constructor(event: H3Event) {
    this.encryptionKey = useRuntimeConfig(event).private.encryptionKey
    if (!this.encryptionKey) {
      console.error('Encryption key is not defined in runtime config!')
    } else {
      console.log('Encryption key loaded successfully.')
    }
  }

  private async encryptValue(value: string): Promise<string> {
    return await seal(value, this.encryptionKey)
  }

  private async decryptValue(value: string): Promise<string> {
    return (await unseal(value, this.encryptionKey)) as string
  }

  async handleAppCallback(userId: number, code: string) {
    const appConfig = await $fetch<GitHubAppResponse>(
      `${this.GITHUB_API}/app-manifests/${code}/conversions`,
      {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github.v3+json'
        }
      }
    )

    await useDrizzle().insert(tables.githubApp).values({
      slug: appConfig.slug,
      appId: appConfig.id,
      privateKey: await this.encryptValue(appConfig.pem),
      webhookSecret: await this.encryptValue(appConfig.webhook_secret),
      clientId: appConfig.client_id,
      clientSecret: await this.encryptValue(appConfig.client_secret),
      userId: userId
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
    if (!app)
      throw createError({
        statusCode: 404,
        statusMessage: 'GitHub App not found'
      })
    const privateKey = await this.decryptValue(app.privateKey)

    const now = Math.floor(Date.now() / 1000)
    const appJWT = jwt.sign(
      {
        iat: now - 60,
        exp: now + 10 * 60,
        iss: app.appId
      },
      privateKey,
      { algorithm: 'RS256' }
    )

    const installations = await $fetch<{ id: number }[]>(
      `${this.GITHUB_API}/app/installations`,
      {
        headers: {
          Authorization: `Bearer ${appJWT}`,
          Accept: 'application/vnd.github.v3+json'
        }
      }
    )
    if (!installations.length)
      throw createError({
        statusCode: 404,
        statusMessage:
          'GitHub App not installed in any repositories'
      })

    const { token } = await $fetch<{
      token: string
      expires_at: string
    }>(`${this.GITHUB_API}/app/installations/${installations[0].id}/access_tokens`, {
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

  async getUserRepos(
    userId: number,
    query?: string
  ): Promise<GitHubRepo[]> {
    const token = await this.getAuthToken(userId)

    try {
      const response = await $fetch<{
        repositories: GitHubRepo[]
      }>(`${this.GITHUB_API}/installation/repositories?per_page=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })
      const repos = response.repositories

      if (!query) return repos

      return repos.filter((repo: GitHubRepo) =>
        repo.name.toLowerCase().includes(query.toLowerCase())
      )
    } catch (error: any) {
      throw createError({
        statusCode: error.status || 500,
        statusMessage: `Failed to fetch repositories: ${error.message}`
      })
    }
  }

  async sendSecrets(
    userId: number,
    repository: string,
    variables: { key: string; value: string }[]
  ) {
    try {
      const token = await this.getAuthToken(userId)

      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { key_id, key } = await $fetch<{
        key_id: string
        key: string
      }>(`${this.GITHUB_API}/repos/${repository}/actions/secrets/public-key`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })

      const binaryPublicKey = Uint8Array.from(
        Buffer.from(key, 'base64')
      )

      for (const { key: secretKey, value: secretValue } of variables) {
        try {
          const binarySecretValue = new TextEncoder().encode(secretValue)
          const encryptedBytes = cryptoBoxSeal(
            binarySecretValue,
            binaryPublicKey
          )
          const encryptedValue = Buffer.from(encryptedBytes).toString(
            'base64'
          )

          await $fetch(`${this.GITHUB_API}/repos/${repository}/actions/secrets/${secretKey}`, {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/vnd.github.v3+json'
            },
            body: {
              encrypted_value: encryptedValue,
              key_id: key_id
            }
          })
        } catch (error: any) {
          throw createError({
            statusCode: 500,
            statusMessage: `Failed to encrypt or send secret ${secretKey}: ${error.message}`
          })
        }
      }

      return {
        statusCode: 201,
        message:
          'Secrets successfully encrypted and sent to GitHub repository'
      }
    } catch (error: any) {
      throw createError({
        statusCode: error.status || 500,
        statusMessage: `Failed to process secrets: ${error.message}`
      })
    }
  }

  async getSecrets(userId: number, repository: string) {
    const token = await this.getAuthToken(userId)

    try {
      return await $fetch(`${this.GITHUB_API}/repos/${repository}/actions/secrets`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })
    } catch (error: any) {
      throw createError({
        statusCode: error.status || 500,
        statusMessage: `Failed to fetch secrets: ${error.message}`
      })
    }
  }

  async getUserApps(userId: number): Promise<GithubApp[]> {
    return await useDrizzle().query.githubApp.findMany({
      where: eq(tables.githubApp.userId, userId)
    })
  }

  async deleteApp(userId: number, slug: string) {
    await useDrizzle()
      .delete(tables.githubApp)
      .where(
        and(
          eq(tables.githubApp.userId, userId),
          eq(tables.githubApp.slug, slug)
        )
      )

    return {
      statusCode: 200,
      message:
        'App removed from Shelve. Dont forget to delete it from GitHub',
      link: `https://github.com/settings/apps/${slug}/advanced`
    }
  }

}

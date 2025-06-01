import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'
import type { GithubApp, GitHubRepo } from '@types'
import nacl from 'tweetnacl'
import { blake2b } from 'blakejs'
import { sanitizeGithubUrl } from '@utils'

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
  private readonly config: ReturnType<typeof useRuntimeConfig>

  constructor(event: H3Event) {
    this.config = useRuntimeConfig(event)
  }

  private getDecodedPrivateKey(): string {
    const base64PrivateKey = this.config.private.github.privateKey

    if (!base64PrivateKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'GitHub App private key is missing'
      })
    }

    try {
      const privateKeyBuffer = Buffer.from(base64PrivateKey, 'base64')

      return privateKeyBuffer.toString('utf8')
    } catch (error) {
      console.error('Error decoding private key:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to decode GitHub App private key'
      })
    }
  }

  private getAppJWT(): string {
    const { clientId } = this.config.oauth.github

    if (!clientId) {
      throw createError({
        statusCode: 500,
        statusMessage: 'GitHub App ID is missing'
      })
    }

    try {
      const privateKey = this.getDecodedPrivateKey()

      const now = Math.floor(Date.now() / 1000)
      return jwt.sign(
        {
          iat: now - 60,
          exp: now + 10 * 60,
          iss: clientId
        },
        privateKey,
        { algorithm: 'RS256' }
      )
    } catch (error: any) {
      console.error('Error signing JWT:', error)
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to sign JWT: ${error.message}`
      })
    }
  }

  private getInstallationToken = cachedFunction(async (installationId: number): Promise<string> => {
    const appJWT = this.getAppJWT()

    try {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { token, expires_at } = await $fetch<{
        token: string
        expires_at: string
      }>(`${this.GITHUB_API}/app/installations/${installationId}/access_tokens`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${appJWT}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })

      return token
    } catch (error: any) {
      console.error('Error getting installation token:', error)
      throw createError({
        statusCode: error.status || 500,
        statusMessage: `Failed to get installation token: ${error.message}`
      })
    }
  })

  getUserRepos = cachedFunction(async (event, userId: number): Promise<GitHubRepo[]> => {
    const installation = await useDrizzle().query.githubApp.findFirst({
      where: eq(tables.githubApp.userId, userId)
    })

    if (!installation) {
      throw createError({
        statusCode: 404,
        statusMessage: 'GitHub App installation not found'
      })
    }

    try {
      const token = await this.getInstallationToken(installation.installationId)

      const response = await $fetch<{
          repositories: GitHubRepo[]
        }>(`${this.GITHUB_API}/installation/repositories?per_page=100`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json'
          }
        })

      return response.repositories
    } catch (error: any) {
      console.error('Error fetching repositories:', error)
      throw createError({
        statusCode: error.status || 500,
        statusMessage: `Failed to fetch repositories: ${error.message}`
      })
    }
  }, {
    maxAge: 60 * 5,
    name: 'getUserRepos',
    getKey: (event: H3Event, userId: number, query?: string) => `user-repos-${userId}-${query || ''}`,
    swr: true
  })

  async sendSecrets(
    userId: number,
    repository: string,
    variables: { key: string; value: string }[]
  ) {
    try {
      const sanitizedRepository = sanitizeGithubUrl(repository)
      const installation = await useDrizzle().query.githubApp.findFirst({
        where: eq(tables.githubApp.userId, userId)
      })

      if (!installation) {
        throw createError({
          statusCode: 404,
          statusMessage: 'GitHub App installation not found'
        })
      }

      const token = await this.getInstallationToken(installation.installationId)
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { key_id, key } = await $fetch<{
        key_id: string
        key: string
      }>(`${this.GITHUB_API}/repos/${sanitizedRepository}/actions/secrets/public-key`, {
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
          const encryptedValue = Buffer.from(encryptedBytes).toString('base64')

          await $fetch(`${this.GITHUB_API}/repos/${sanitizedRepository}/actions/secrets/${secretKey}`, {
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
        message: 'Secrets successfully encrypted and sent to GitHub repository'
      }
    } catch (error: any) {
      throw createError({
        statusCode: error.status || 500,
        statusMessage: `Failed to process secrets: ${error.message}`
      })
    }
  }

  async getUserApps(userId: number): Promise<GithubApp[]> {
    return await useDrizzle().query.githubApp.findMany({
      where: eq(tables.githubApp.userId, userId)
    })
  }

  async deleteApp(userId: number, installationId: number) {
    await useDrizzle()
      .delete(tables.githubApp)
      .where(
        and(
          eq(tables.githubApp.userId, userId),
          eq(tables.githubApp.installationId, installationId)
        )
      )
    return {
      statusCode: 200,
      message: 'App removed from Shelve. Dont forget to delete it from GitHub',
      link: `https://github.com/settings/installations/${installationId}`
    }
  }

}

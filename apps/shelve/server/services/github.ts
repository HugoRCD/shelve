import { createHash } from 'node:crypto'
import jwt from 'jsonwebtoken'
import type { H3Event } from 'h3'
import type { GitHubRepo } from '@types'
import nacl from 'tweetnacl'
import { blake2b } from 'blakejs'
import { sanitizeGithubUrl } from '@utils'
import { GITHUB_SIGN_IN_REQUIRED } from '../../shared/github'
import type { UserSession } from '#auth-utils'

/** `owner/name`, where the name is not `.` or `..`. */
export const GITHUB_REPOSITORY_PATTERN = /^[\w-]+\/(?!\.\.?$)[\w.-]+$/
/** GitHub's rule for secret names; names are case-insensitive and the `GITHUB_` prefix is reserved. */
export const GITHUB_SECRET_NAME_PATTERN = /^(?!github_)[a-z_][a-z0-9_]*$/i
export const GITHUB_SECRET_NAME_MESSAGE = 'Secret names can only contain letters, digits and underscores, and can\'t start with GITHUB_'

/** A repository as GitHub returns it to a user token, with that user's own access to it. */
type UserRepository = GitHubRepo & { permissions?: { admin?: boolean } }

/** Where to write secrets: a repository the user administers, and a token that can only write its secrets. */
export type SecretsTarget = { repository: string; token: string }

function githubSignInError(statusMessage: string) {
  return createError({ statusCode: 403, statusMessage, data: { reason: GITHUB_SIGN_IN_REQUIRED } })
}

/** The HTTP status of a failed GitHub request, if GitHub answered. */
function githubStatus(error: unknown): number | undefined {
  return (error as { response?: { status?: number } } | undefined)?.response?.status
}

export function assertGithubSecretNames(keys: string[]) {
  if (keys.some(key => !GITHUB_SECRET_NAME_PATTERN.test(key))) {
    throw createError({ statusCode: 400, statusMessage: GITHUB_SECRET_NAME_MESSAGE })
  }
}

/** The GitHub token of the signed-in user. Only a GitHub sign-in stores one, and signing in replaces the whole session. */
export function requireGithubToken(session: UserSession): string {
  if (!session.secure?.githubToken) {
    throw githubSignInError('Sign in to Shelve with GitHub to use your repositories')
  }
  return session.secure.githubToken
}

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

  private appHeaders() {
    return { Authorization: `Bearer ${this.getAppJWT()}`, Accept: 'application/vnd.github+json' }
  }

  /** Calls GitHub as the signed-in user, so GitHub only answers with what that user can access. */
  private async fetchAsUser<T>(githubToken: string, path: string, query?: Record<string, string | number>): Promise<T> {
    try {
      return await $fetch<T>(`${this.GITHUB_API}${path}`, {
        query,
        headers: { Authorization: `Bearer ${githubToken}`, Accept: 'application/vnd.github+json' },
      })
    } catch (error) {
      const status = githubStatus(error)
      if (status === 401) throw githubSignInError('Your GitHub sign-in has expired, sign in to Shelve with GitHub again')
      if (status === 403 || status === 404) throw createError({ statusCode: status, statusMessage: 'GitHub refused the request' })
      throw createError({ statusCode: 502, statusMessage: 'Failed to reach GitHub' })
    }
  }

  /** An installation token that can only write the Actions secrets of one repository. */
  private getSecretsToken = cachedFunction(async (installationId: number, repositoryId: number): Promise<string> => {
    try {
      const { token } = await $fetch<{ token: string }>(`${this.GITHUB_API}/app/installations/${installationId}/access_tokens`, {
        method: 'POST',
        headers: this.appHeaders(),
        body: { repository_ids: [repositoryId], permissions: { secrets: 'write' } },
      })
      return token
    } catch (error: any) {
      console.error('Error getting installation token:', error)
      throw createError({
        statusCode: 502,
        statusMessage: `Failed to get installation token: ${error.message}`
      })
    }
  }, {
    name: 'githubSecretsToken',
    // Installation tokens expire after an hour.
    maxAge: 50 * 60,
    swr: false,
    getKey: (installationId: number, repositoryId: number) => `${installationId}:${repositoryId}`,
  })

  /** Repositories of the user's linked installations that the user administers, as GitHub lists them for the user. */
  getUserRepos = cachedFunction(async (event: H3Event, userId: number, githubToken: string): Promise<GitHubRepo[]> => {
    const installations = await this.getUserApps(userId)

    if (!installations.length) {
      throw createError({
        statusCode: 404,
        statusMessage: 'GitHub App installation not found'
      })
    }

    const repositories: GitHubRepo[] = []
    for (const { installationId } of installations) {
      for (let page = 1; page <= 10; page++) {
        const response = await this.fetchAsUser<{ repositories: UserRepository[] }>(
          githubToken,
          `/user/installations/${installationId}/repositories`,
          { per_page: 100, page },
        ).catch((error) => {
          // GitHub no longer shows this installation to the user.
          if (error.statusCode === 404) return { repositories: [] }
          throw error
        })
        repositories.push(...response.repositories.filter(repository => repository.permissions?.admin === true))
        if (response.repositories.length < 100) break
      }
    }
    return repositories
  }, {
    maxAge: 60 * 5,
    name: 'githubUserRepos',
    // Per GitHub sign-in, so a list is never shown to a session of another GitHub account.
    getKey: (_event: H3Event, userId: number, githubToken: string) => `${userId}:${createHash('sha256').update(githubToken).digest('hex').slice(0, 16)}`,
    swr: false
  })

  /**
   * Checks that the signed-in user administers the repository on GitHub and that it belongs to one of
   * their linked installations, then gets a token that can only write that repository's secrets.
   */
  async getSecretsTarget(userId: number, repository: string, githubToken: string): Promise<SecretsTarget> {
    const name = sanitizeGithubUrl(repository).replace(/\/+$/, '')
    if (!GITHUB_REPOSITORY_PATTERN.test(name)) {
      throw createError({ statusCode: 400, statusMessage: 'Repository must be owner/name' })
    }

    let found: UserRepository
    try {
      found = await this.fetchAsUser<UserRepository>(githubToken, `/repos/${name}`)
    } catch (error: any) {
      if (error.statusCode === 404) {
        throw createError({ statusCode: 404, statusMessage: `Repository ${name} not found with your GitHub account` })
      }
      throw error
    }
    if (found.permissions?.admin !== true) {
      throw createError({ statusCode: 403, statusMessage: `You need admin access to ${found.full_name} on GitHub to sync its secrets` })
    }

    const installation = await $fetch<{ id: number }>(`${this.GITHUB_API}/repos/${found.full_name}/installation`, {
      headers: this.appHeaders(),
    }).catch((error) => {
      if (githubStatus(error) === 404) return undefined
      throw createError({ statusCode: 502, statusMessage: 'Failed to find the GitHub App installation of the repository' })
    })
    const linked = installation && await db.query.githubApp.findFirst({
      where: and(eq(schema.githubApp.userId, userId), eq(schema.githubApp.installationId, installation.id)),
      columns: { id: true },
    })
    if (!installation || !linked) {
      throw createError({ statusCode: 404, statusMessage: `Connect the GitHub App installed on ${found.full_name} to Shelve first` })
    }

    const token = await this.getSecretsToken(installation.id, found.id)
    if (!token) throw createError({ statusCode: 502, statusMessage: 'Failed to get installation token' })
    return { repository: found.full_name, token }
  }

  async pushSecrets(target: SecretsTarget, variables: { key: string; value: string }[]) {
    assertGithubSecretNames(variables.map(({ key }) => key))

    const headers = { Authorization: `Bearer ${target.token}`, Accept: 'application/vnd.github+json' }
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { key_id, key } = await $fetch<{
      key_id: string
      key: string
    }>(`${this.GITHUB_API}/repos/${target.repository}/actions/secrets/public-key`, { headers }).catch((error) => {
      throw createError({
        statusCode: 502,
        statusMessage: `Failed to get the repository public key: ${error.message}`
      })
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

        await $fetch(`${this.GITHUB_API}/repos/${target.repository}/actions/secrets/${secretKey}`, {
          method: 'PUT',
          headers,
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
  }

  async sendSecrets(
    userId: number,
    repository: string,
    variables: { key: string; value: string }[],
    githubToken: string
  ) {
    assertGithubSecretNames(variables.map(({ key }) => key))
    await this.pushSecrets(await this.getSecretsTarget(userId, repository, githubToken), variables)
    return {
      statusCode: 201,
      message: 'Secrets successfully encrypted and sent to GitHub repository'
    }
  }

  getUserApps(userId: number) {
    return db.query.githubApp.findMany({
      where: eq(schema.githubApp.userId, userId)
    })
  }

  async deleteApp(userId: number, installationId: number) {
    await db
      .delete(schema.githubApp)
      .where(
        and(
          eq(schema.githubApp.userId, userId),
          eq(schema.githubApp.installationId, installationId)
        )
      )
    return {
      statusCode: 200,
      message: 'App removed from Shelve. Dont forget to delete it from GitHub',
      link: `https://github.com/settings/installations/${installationId}`
    }
  }

}

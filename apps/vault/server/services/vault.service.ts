import type { H3Event } from 'h3'
import type { DecryptRequest, DecryptResponse, EncryptRequest, StoredData } from '@types'
import {
  MAX_PASSWORD_ATTEMPTS,
  TTL_MAP,
  calculateTimeLeft,
  formatTimeLeft,
  generateShareId,
  getEncryptionKey,
  hashPassword,
  verifyPassword
} from '../utils/vault'

type VaultEntry = StoredData & { failedAttempts?: number }

export class VaultService {

  private readonly encryptionKey: string
  private readonly siteUrl: string
  private readonly storage = kv
  private readonly PREFIX = 'cache:'

  constructor(event: H3Event) {
    const config = useRuntimeConfig(event)
    const url = getRequestURL(event)
    this.encryptionKey = config.private.encryptionKey
    this.siteUrl = url.origin
  }

  private generateKey(id: string): string {
    return `${this.PREFIX}${id}`
  }

  /** Lets the KV store drop the entry once it expires. `Infinite` entries (-1) get no TTL. */
  private ttlOptions(secondsLeft: number): { ttl: number } | undefined {
    return secondsLeft > 0 ? { ttl: secondsLeft } : undefined
  }

  /**
   * Counts a wrong password on the entry and deletes the entry at the limit.
   * Best effort: the read-modify-write isn't atomic, so concurrent wrong guesses may be counted once.
   */
  private async rejectWrongPassword(key: string, storedData: VaultEntry, timeLeft: number): Promise<never> {
    const failedAttempts = (storedData.failedAttempts ?? 0) + 1

    if (failedAttempts >= MAX_PASSWORD_ATTEMPTS) {
      await this.storage.del(key)
      throw createError({
        statusCode: 400,
        statusMessage: 'Too many invalid password attempts, the secret has been deleted'
      })
    }

    await this.storage.set(key, { ...storedData, failedAttempts }, this.ttlOptions(timeLeft))
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid password'
    })
  }

  async decrypt(id: string, decryptRequest?: DecryptRequest): Promise<DecryptResponse> {
    const key = this.generateKey(id)
    const storedData = await this.storage.get<VaultEntry>(key)

    if (!storedData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid id or link has expired'
      })
    }

    const { encryptedValue, reads, createdAt, ttl, passwordHash } = storedData
    const timeLeft = calculateTimeLeft(createdAt, ttl)

    if (timeLeft === 0) {
      await this.storage.del(key)
      throw createError({
        statusCode: 400,
        statusMessage: 'Link has expired'
      })
    }

    if (reads <= 0) {
      await this.storage.del(key)
      throw createError({
        statusCode: 400,
        statusMessage: 'Maximum number of reads reached'
      })
    }

    if (passwordHash) {
      if (!decryptRequest?.password) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Password required'
        })
      }
      const isValidPassword = await verifyPassword(decryptRequest.password, passwordHash)
      if (!isValidPassword) {
        await this.rejectWrongPassword(key, storedData, timeLeft)
      }
    }

    const derivedKey = await getEncryptionKey(this.encryptionKey, decryptRequest?.password)
    const decryptedValue = await unseal(encryptedValue, derivedKey) as string

    const updatedReads = reads - 1
    await this.storage.set(key, {
      ...storedData,
      reads: updatedReads
    }, this.ttlOptions(timeLeft))

    if (updatedReads === 0) {
      await this.storage.del(key)
    }

    return {
      decryptedValue,
      reads: updatedReads,
      ttl: formatTimeLeft(timeLeft)
    }
  }

  async encrypt(data: EncryptRequest): Promise<string> {
    const derivedKey = await getEncryptionKey(this.encryptionKey, data.password)
    const encryptedValue = await seal(data.value, derivedKey)
    const shareId = generateShareId()
    const key = this.generateKey(shareId)

    const storedData: StoredData = {
      encryptedValue,
      reads: data.reads,
      createdAt: Date.now(),
      ttl: data.ttl,
      ...(data.password && { passwordHash: await hashPassword(data.password) })
    }

    await this.storage.set(key, storedData, this.ttlOptions(TTL_MAP[data.ttl]))
    return this.generateShareUrl(shareId)
  }

  private generateShareUrl(id: string): string {
    return `${this.siteUrl}?id=${id}`
  }

}

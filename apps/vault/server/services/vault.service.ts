import type { H3Event } from 'h3'
import type { DecryptRequest, DecryptResponse, EncryptRequest, StoredData } from '@types'
import { calculateTimeLeft, formatTimeLeft, getEncryptionKey, hashPassword, verifyPassword } from '../utils/vault'

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

  private generateRandomId(): string {
    return Math.random().toString(36).slice(2)
  }

  async decrypt(id: string, decryptRequest?: DecryptRequest): Promise<DecryptResponse> {
    const key = this.generateKey(id)
    const storedData = await this.storage.get<StoredData>(key)

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
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid password'
        })
      }
    }

    const derivedKey = await getEncryptionKey(this.encryptionKey, decryptRequest?.password)
    const decryptedValue = await unseal(encryptedValue, derivedKey) as string

    const updatedReads = reads - 1
    await this.storage.set(key, {
      ...storedData,
      reads: updatedReads
    })

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
    const randomId = this.generateRandomId()
    const key = this.generateKey(randomId)

    const storedData: StoredData = {
      encryptedValue,
      reads: data.reads,
      createdAt: Date.now(),
      ttl: data.ttl,
      ...(data.password && { passwordHash: await hashPassword(data.password) })
    }

    await this.storage.set(key, storedData)
    return this.generateShareUrl(randomId)
  }

  private generateShareUrl(id: string): string {
    return `${this.siteUrl}?id=${id}`
  }

}

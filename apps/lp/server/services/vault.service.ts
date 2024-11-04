import type { DecryptResponse, EncryptRequest, StoredData, TTLFormat } from '@shelve/types'
import { seal, unseal } from '@shelve/crypto'

export class VaultService {

  private readonly storage: Storage
  private readonly encryptionKey: string
  private readonly siteUrl: string
  private readonly PREFIX = 'vault:'

  private readonly TTL_MAP = {
    '1d': 24 * 60 * 60, // 1 day in seconds
    '7d': 7 * 24 * 60 * 60, // 7 days in seconds
    '30d': 30 * 24 * 60 * 60 // 30 days in seconds
  }

  constructor() {
    const config = useRuntimeConfig()
    this.encryptionKey = config.private.encryptionKey
    this.siteUrl = config.public.siteUrl
    this.storage = useStorage('vault')
  }

  private generateKey(id: string): string {
    return `${this.PREFIX}${id}`
  }

  private generateRandomId(): string {
    return Math.random().toString(36).slice(2)
  }

  private calculateTimeLeft(createdAt: number, ttl: TTLFormat): number {
    const ttlInSeconds = this.TTL_MAP[ttl]
    const now = Date.now()
    const expiresAt = createdAt + (ttlInSeconds * 1000)
    return Math.max(0, Math.floor((expiresAt - now) / 1000))
  }

  private formatTimeLeft(seconds: number): string {
    if (seconds <= 0) return 'Expired'

    const days = Math.floor(seconds / (24 * 60 * 60))
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((seconds % (60 * 60)) / 60)

    const parts = []

    if (days > 0) {
      parts.push(`${days}d`)
    }
    if (hours > 0) {
      parts.push(`${hours}h`)
    }
    if (minutes > 0) {
      parts.push(`${minutes}m`)
    }

    // If less than a minute left
    if (parts.length === 0) {
      return 'Less than 1 minute'
    }

    return parts.join(' ')
  }

  async decrypt(id: string): Promise<DecryptResponse> {
    const key = this.generateKey(id)
    const storedData = await this.storage.getItem<StoredData>(key)

    if (!storedData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid id or link has expired'
      })
    }

    const { encryptedValue, reads, createdAt, ttl } = storedData
    const timeLeft = this.calculateTimeLeft(createdAt, ttl)

    if (timeLeft <= 0) {
      await this.storage.removeItem(key)
      throw createError({
        statusCode: 400,
        statusMessage: 'Link has expired'
      })
    }

    if (reads <= 0) {
      await this.storage.removeItem(key)
      throw createError({
        statusCode: 400,
        statusMessage: 'Maximum number of reads reached'
      })
    }

    const decryptedValue = await unseal(encryptedValue, this.encryptionKey)

    const updatedReads = reads - 1
    await this.storage.setItem(key, {
      ...storedData,
      reads: updatedReads
    })

    if (updatedReads === 0) {
      await this.storage.removeItem(key)
    }

    return {
      decryptedValue,
      reads: updatedReads,
      ttl: this.formatTimeLeft(timeLeft)
    }
  }

  async encrypt(data: EncryptRequest): Promise<string> {
    const encryptedValue = await seal(data.value, this.encryptionKey)
    const randomId = this.generateRandomId()
    const key = this.generateKey(randomId)

    const storedData: StoredData = {
      encryptedValue,
      reads: data.reads,
      createdAt: Date.now(),
      ttl: data.ttl
    }

    await this.storage.setItem(key, storedData)
    return this.generateShareUrl(randomId)
  }

  private generateShareUrl(id: string): string {
    return `${this.siteUrl}/vault?id=${id}`
  }

}

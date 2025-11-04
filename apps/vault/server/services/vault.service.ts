import type { H3Event } from 'h3'
import type { DecryptRequest, DecryptResponse, EncryptRequest, StoredData, TTLFormat } from '@types'

export class VaultService {

  private readonly encryptionKey: string
  private readonly siteUrl: string
  private readonly storage = useStorage('vault')
  private readonly PREFIX = 'cache:'

  private readonly TTL_MAP = {
    '1d': 24 * 60 * 60, // 1 day in seconds
    '7d': 7 * 24 * 60 * 60, // 7 days in seconds
    '30d': 30 * 24 * 60 * 60, // 30 days in seconds
    'Infinite': -1 // Infinite TTL
  }

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

  private calculateTimeLeft(createdAt: number, ttl: TTLFormat): number {
    const ttlInSeconds = this.TTL_MAP[ttl]

    if (ttlInSeconds === -1) {
      return -1
    }

    const now = Date.now()
    const expiresAt = createdAt + (ttlInSeconds * 1000)
    return Math.max(0, Math.floor((expiresAt - now) / 1000))
  }

  private formatTimeLeft(seconds: number): string {
    if (seconds === -1) return 'Infinite'

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
    const timeLeft = this.calculateTimeLeft(createdAt, ttl)

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
      const isValidPassword = await this.verifyPassword(decryptRequest.password, passwordHash)
      if (!isValidPassword) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid password'
        })
      }
    }

    const encryptionKey = await this.getEncryptionKey(decryptRequest?.password)
    const decryptedValue = await unseal(encryptedValue, encryptionKey) as string

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
      ttl: this.formatTimeLeft(timeLeft)
    }
  }

  async encrypt(data: EncryptRequest): Promise<string> {
    const encryptionKey = await this.getEncryptionKey(data.password)
    const encryptedValue = await seal(data.value, encryptionKey)
    const randomId = this.generateRandomId()
    const key = this.generateKey(randomId)

    const storedData: StoredData = {
      encryptedValue,
      reads: data.reads,
      createdAt: Date.now(),
      ttl: data.ttl,
      ...(data.password && { passwordHash: await this.hashPassword(data.password) })
    }

    await this.storage.set(key, storedData)
    return this.generateShareUrl(randomId)
  }

  private generateShareUrl(id: string): string {
    return `${this.siteUrl}?id=${id}`
  }

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password)
    return passwordHash === hash
  }

  private async generateSecureKey(): Promise<string> {
    const salt = 'vault-encryption-secured-salt'
    const combined = this.encryptionKey ? `${this.encryptionKey}:${salt}` : salt
    const hash = await this.hashPassword(combined)
    return hash
  }

  private async getEncryptionKey(password?: string): Promise<string> {
    const baseKey = this.encryptionKey || ''

    if (password && password.trim() !== '') {
      const combined = baseKey ? `${baseKey}:${password}` : password
      const hash = await this.hashPassword(combined)
      return hash
    }

    if (baseKey && baseKey.length >= 32) {
      return baseKey
    }

    return await this.generateSecureKey()
  }

}

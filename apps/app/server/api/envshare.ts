import { H3Event } from 'h3'
import { seal, unseal } from '@shelve/crypto'

type EncryptRequest = {
  value: string
  reads: number
  ttl: number
}

type StoredData = {
  encryptedValue: string
  reads: number
  createdAt: number
  ttl: number
}

type DecryptResponse = {
  decryptedValue: string
  readsLeft: number
  timeLeft: number
}

class EnvShareService {

  private readonly storage: Storage
  private readonly encryptionKey: string
  private readonly siteUrl: string
  private readonly PREFIX = 'envshare:'

  constructor() {
    const config = useRuntimeConfig()
    this.encryptionKey = config.private.encryptionKey
    this.siteUrl = config.public.siteUrl
    this.storage = useStorage('cache')
  }

  private generateKey(id: string): string {
    return `${this.PREFIX}${id}`
  }

  private generateRandomId(): string {
    return Math.random().toString(36).slice(2)
  }

  private calculateTimeLeft(createdAt: number, ttl: number): number {
    const now = Date.now()
    const expiresAt = createdAt + ttl * 1000 // Convert ttl to milliseconds
    return Math.max(0, Math.floor((expiresAt - now) / 1000)) // Return remaining seconds
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
      ttl: timeLeft
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
    return `${this.siteUrl}/envshare?id=${id}`
  }

}

export default defineEventHandler(async (event: H3Event) => {
  const service = new EnvShareService()
  const { id } = await getQuery(event)

  if (id) {
    return service.decrypt(id)
  }

  const body = await readBody(event)
  return service.encrypt(body)
})

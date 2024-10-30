import { H3Event } from 'h3'
import { seal, unseal } from '@shelve/crypto'

type EncryptRequest = {
  value: string
  reads: number
  ttl: number
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

  async decrypt(id: string): Promise<{ decryptedValue: string }> {
    const key = this.generateKey(id)
    const value = await this.storage.getItem(key)

    if (!value) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid id'
      })
    }

    const decryptedValue = await unseal(value, this.encryptionKey)
    return { decryptedValue }
  }

  async encrypt(data: EncryptRequest): Promise<string> {
    const encryptedValue = await seal(data.value, this.encryptionKey)
    const randomId = this.generateRandomId()
    const key = this.generateKey(randomId)

    await this.storage.setItem(key, encryptedValue)
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

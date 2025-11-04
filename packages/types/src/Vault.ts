export type TTLFormat = '1d' | '7d' | '30d' | 'Infinite'

export type EncryptRequest = {
  value: string
  reads: number
  ttl: TTLFormat
  password?: string
}

export type StoredData = {
  encryptedValue: string
  reads: number
  createdAt: number
  ttl: TTLFormat
  passwordHash?: string
}

export type DecryptResponse = {
  decryptedValue: string
  reads: number
  ttl: string
}

export type DecryptRequest = {
  password?: string
}

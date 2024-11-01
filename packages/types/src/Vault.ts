export type TTLFormat = '1d' | '7d' | '30d'

export type EncryptRequest = {
  value: string
  reads: number
  ttl: TTLFormat
}

export type StoredData = {
  encryptedValue: string
  reads: number
  createdAt: number
  ttl: TTLFormat
}

export type DecryptResponse = {
  decryptedValue: string
  reads: number
  ttl: string
}

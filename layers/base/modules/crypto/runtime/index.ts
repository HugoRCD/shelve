import * as Iron from 'iron-webcrypto'

export async function seal<T>(object: T, password: string): Promise<string> {
  const _crypto = globalThis.crypto
  return await Iron.seal(_crypto, object, password, Iron.defaults)
}

export async function unseal(sealed: string, password: string) {
  const _crypto = globalThis.crypto
  return await Iron.unseal(_crypto, sealed, password, Iron.defaults)
}

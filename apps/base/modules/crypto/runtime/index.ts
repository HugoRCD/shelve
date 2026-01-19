import * as Iron from 'iron-webcrypto'

const options = { ...Iron.defaults, crypto: globalThis.crypto }

export async function seal<T>(object: T, password: string): Promise<string> {
  const payload = { data: JSON.stringify(object) }
  return await Iron.seal(payload, password, options)
}

export async function unseal(sealed: string, password: string) {
  const payload = await Iron.unseal(sealed, password, options) as { data: string }
  return JSON.parse(payload.data)
}

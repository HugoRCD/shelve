import { ofetch } from 'ofetch'
import consola from 'consola'
import { loadShelveConfig } from './config'

export async function useApi(): Promise<typeof ofetch> {
  const { url, token } = await loadShelveConfig()

  const sanitizedUrl = url.replace(/\/+$/, '') // remove trailing slash
  const baseURL = `${sanitizedUrl}/api`

  return ofetch.create({
    baseURL,
    onRequest({ options }) {
      options.headers = {
        ...options.headers,
        Cookie: `authToken=${token}`
      }
    },
    onResponseError(ctx) {
      console.log(ctx.response)
      if (ctx.response.status === 401) {
        consola.error('Authentication failed, please verify your token')
        process.exit(1)
      }
    }
  })
}
